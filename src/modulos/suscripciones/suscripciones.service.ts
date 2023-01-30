import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { IRangeQuery } from '@util/irangequery.interface';
import { WhereParam } from '@util/whereparam';
import { ISearchField } from '@util/isearchfield.interface';
import { ResumenCantMonto } from '@dto/resumen-cant-monto.dto';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';

@Injectable()
export class SuscripcionesService {

    constructor(
        @InjectRepository(Suscripcion)
        private suscripcionRepo: Repository<Suscripcion>,
        @InjectRepository(SuscripcionView)
        private suscripcionViewRepo: Repository<SuscripcionView>,
        private datasource: DataSource,
        private dbsrv: DatabaseService
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<SuscripcionView> {
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            sort,
            offset,
            limit,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta,
            iddepartamento,
            iddistrito,
            idbarrio,
            search
        } = queries;
        
        const alias = 'suscripcion';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias);

        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });

        if (idcliente)
            if (Array.isArray(idcliente)) query = query.andWhere(`${alias}.idcliente IN (:...idcliente)`, { idcliente });
            else query = query.andWhere(`${alias}.idcliente = :idcliente`, { idcliente });

        if (idgrupo || idservicio)
            query = query.andWhere(new Brackets(qb => {
                if (idgrupo)
                    if (Array.isArray(idgrupo)) qb = qb.orWhere(`${alias}.idgrupo IN (:...idgrupo)`, { idgrupo });
                    else qb = qb.andWhere(`${alias}.idgrupo = :idgrupo`, { idgrupo });
                if (idservicio)
                    if (Array.isArray(idservicio)) qb = qb.orWhere(`${alias}.idservicio IN (:...idservicio)`, { idservicio });
                    else qb = qb.orWhere(`${alias}.idservicio = :idservicio`, { idservicio });
            }));

        if (iddepartamento || iddistrito || idbarrio)
            query = query.andWhere(new Brackets(qb => {
                if (iddepartamento)
                    if (Array.isArray(iddepartamento)) qb = qb.orWhere(`${alias}.iddepartamento IN (:...iddepartamento)`, { iddepartamento });
                    else qb = qb.orWhere(`${alias}.iddepartamento  = :iddepartamento`, { iddepartamento });
                if (iddistrito)
                    if (Array.isArray(iddistrito)) qb = qb.orWhere(`${alias}.iddistrito IN (:...iddistrito)`, { iddistrito });
                    else qb = qb.orWhere(`${alias}.iddistrito = :iddistrito`, { iddistrito });
                if (idbarrio)
                    if (Array.isArray(idbarrio)) qb = qb.orWhere(`${alias}.idbarrio IN (:...idbarrio)`, { idbarrio });
                    else qb = qb.orWhere(`${alias}.idbarrio = :idbarrio`, { idbarrio });
            }));

        if (estado) query = query.andWhere(`${alias}.estado = :estado`, { estado });
        if (fechainiciosuscripcion) query = query.andWhere(`${alias}.fechasuscripcion >= :fechainiciosuscripcion`, { fechainiciosuscripcion: new Date(`${fechainiciosuscripcion}T00:00:00`) });
        if (fechafinsuscripcion) query = query.andWhere(`${alias}.fechasuscripcion <= :fechafinsuscripcion`, { fechafinsuscripcion: new Date(`${fechafinsuscripcion}T00:00:00`) });
        if (cuotaspendientesdesde) query = query.andWhere(`${alias}.cuotaspendientes >= :cuotaspendientesdesde`, { cuotaspendientesdesde });
        if (cuotaspendienteshasta) query = query.andWhere(`${alias}.cuotaspendientes <= :cuotaspendienteshasta`, { cuotaspendienteshasta });
        if (search){
            query = query.andWhere(new Brackets(qb => {
                if(Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, {idsearch: search});
                qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :clisearch`, { clisearch: `%${search.toLowerCase()}%`});
            }));
        }
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getEventoAuditoria(idusuario, operacion: 'R' | 'M' | 'E', oldValue: any, newValue: any): EventoAuditoria{
        const evento = new EventoAuditoria();
        evento.fechahora = new Date();
        evento.idtabla = TablasAuditoriaList.SUSCRIPCIONES.id;
        evento.operacion = operacion;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        evento.idusuario = idusuario;
        return evento;
    }

    findAll(queries: {[name: string]: any}): Promise<SuscripcionView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: {[name: string]: any}): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async getLastId(): Promise<number> {
        return (await this.suscripcionViewRepo.createQueryBuilder('suscripcion')
        .select('MAX(suscripcion.id)', 'lastid')
        .getRawOne()).lastid;
    }

    async create(s: Suscripcion, idusuario: number) {
        const oldSuscripcion = await this.suscripcionRepo.findOneBy({id: s.id});
        
        if(oldSuscripcion && !oldSuscripcion.eliminado) throw new HttpException({
            message: `La suscripción con código «${s.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(s);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', oldSuscripcion, s));
        });
    }

    findById(id: number): Promise<SuscripcionView> {
        return this.suscripcionViewRepo.findOneByOrFail({id});
    }

    async edit(oldId: number, s: Suscripcion, idusuario: number) {
        const oldSuscripcion = await this.suscripcionRepo.findOneByOrFail({id: oldId});

        if(oldId != s.id && await this.suscripcionRepo.findOneBy({id: s.id, eliminado: false})) throw new HttpException({
            message: `La suscripción con código «${s.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(s);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldSuscripcion, s));
            if(oldId != s.id) await manager.remove(oldSuscripcion);
        });
    }

    async delete(id: number, idusuario: number) {
        const suscripcion = await this.suscripcionRepo.findOneByOrFail({id});
        const oldSuscripcion = {...suscripcion};
        suscripcion.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(suscripcion);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldSuscripcion, suscripcion));
        });
    }

    async getResumenSuscCuotasPendientes(params): Promise<ResumenCantMonto[]> {
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta,
            iddepartamento,
            iddistrito,
            idbarrio,
            search
        } = params;
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechasuscripcion::date',
                    startValue: fechainiciosuscripcion,
                    endValue: fechafinsuscripcion
                },
                {
                    fieldName: 'cuotaspendientes',
                    startValue: cuotaspendientesdesde,
                    endValue: cuotaspendienteshasta
                }
            ]
        };

        const searchQuery: ISearchField[] = [
            {
                fieldName: 'id',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'cliente',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'monto',
                fieldValue: search,
                exactMatch: true
            }
        ];

        const wp: WhereParam = new WhereParam(
            { eliminado, idcliente, estado },
            [
                { idgrupo, idservicio },
                { iddepartamento, iddistrito, idbarrio }
            ],
            rangeQuery,
            searchQuery,
            null
        );

        const query: string = `SELECT vw_suscripciones.cuotaspendientes AS referencia, COUNT(*) as cantidad, SUM(vw_suscripciones.deuda) AS monto
        FROM public.vw_suscripciones ${wp.whereStr}
        GROUP BY cuotaspendientes
        ORDER BY cuotaspendientes ASC`;
        /*const rows: ResumenCantSuscDeuda[] = (await this.dbsrv.execute(query, wp.whereParams)).rows;
        const rowsFilled: ResumenCantSuscDeuda [] = [];
        let min: number = 999;
        let max: number = 0;
        for(let r of rows){
            if(Number(r.referencia) < min) min = Number(r.referencia);
            if(Number(r.referencia) > max) max = Number(r.referencia);
        }
        for(let i = min; i <= max; i++){
            
            let existe: boolean = false;
            for(let r of rows){
                
                if( Number(r.referencia) === i){
                    rowsFilled.push(r);
                    existe = true;
                    break;
                };
            }
            if(!existe) rowsFilled.push({referencia: i, cantidad: 0, monto: 0});
        }*/
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async getResumenSuscEstados(params): Promise<ResumenCantMonto[]> {
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta,
            iddepartamento,
            iddistrito,
            idbarrio,
            search
        } = params;
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechasuscripcion::date',
                    startValue: fechainiciosuscripcion,
                    endValue: fechafinsuscripcion
                },
                {
                    fieldName: 'cuotaspendientes',
                    startValue: cuotaspendientesdesde,
                    endValue: cuotaspendienteshasta
                }
            ]
        };

        const searchQuery: ISearchField[] = [
            {
                fieldName: 'id',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'cliente',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'monto',
                fieldValue: search,
                exactMatch: true
            }
        ];

        const wp: WhereParam = new WhereParam(
            { eliminado, idcliente, estado },
            [
                { idgrupo, idservicio },
                { iddepartamento, iddistrito, idbarrio }
            ],
            rangeQuery,
            searchQuery,
            null
        );
        const query: string = `SELECT estado AS referencia, COUNT(*) AS cantidad, SUM(deuda) AS monto
        FROM public.vw_suscripciones ${wp.whereStr}
        GROUP BY estado
        ORDER BY
            CASE estado
            WHEN 'C' THEN 1
            WHEN 'R' THEN 2
            WHEN 'D' THEN 3
            ELSE 4
        END`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async getResumenGrupos(params): Promise<ResumenCantMonto[]> {
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta,
            iddepartamento,
            iddistrito,
            idbarrio,
            search
        } = params;
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechasuscripcion::date',
                    startValue: fechainiciosuscripcion,
                    endValue: fechafinsuscripcion
                },
                {
                    fieldName: 'cuotaspendientes',
                    startValue: cuotaspendientesdesde,
                    endValue: cuotaspendienteshasta
                }
            ]
        };

        const searchQuery: ISearchField[] = [
            {
                fieldName: 'id',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'cliente',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'monto',
                fieldValue: search,
                exactMatch: true
            }
        ];

        const wp: WhereParam = new WhereParam(
            { eliminado, idcliente, estado },
            [
                { idgrupo, idservicio },
                { iddepartamento, iddistrito, idbarrio }
            ],
            rangeQuery,
            searchQuery,
            null
        );
        const query: string = `SELECT idgrupo AS idreferencia, grupo AS referencia, COUNT(*) AS cantidad, SUM(deuda) AS monto
        FROM public.vw_suscripciones ${wp.whereStr}
        GROUP BY idgrupo, grupo
        ORDER BY grupo ASC`;
        return (this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async getResumenServicios(params): Promise<ResumenCantMonto[]> {
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta,
            iddepartamento,
            iddistrito,
            idbarrio,
            search
        } = params;
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechasuscripcion::date',
                    startValue: fechainiciosuscripcion,
                    endValue: fechafinsuscripcion
                },
                {
                    fieldName: 'cuotaspendientes',
                    startValue: cuotaspendientesdesde,
                    endValue: cuotaspendienteshasta
                }
            ]
        };

        const searchQuery: ISearchField[] = [
            {
                fieldName: 'id',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'cliente',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'monto',
                fieldValue: search,
                exactMatch: true
            }
        ];

        const wp: WhereParam = new WhereParam(
            { eliminado, idcliente, estado },
            [
                { idgrupo, idservicio },
                { iddepartamento, iddistrito, idbarrio }
            ],
            rangeQuery,
            searchQuery,
            null
        );
        const query: string = `SELECT idservicio AS idreferencia, servicio AS referencia, COUNT(*) AS cantidad, SUM(deuda) AS monto
        FROM public.vw_suscripciones ${wp.whereStr}
        GROUP BY idservicio, servicio ORDER BY servicio DESC`;
        return (this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async getResumenGruposServicios(params): Promise<ResumenCantMonto[]> {
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta,
            iddepartamento,
            iddistrito,
            idbarrio,
            search
        } = params;
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechasuscripcion::date',
                    startValue: fechainiciosuscripcion,
                    endValue: fechafinsuscripcion
                },
                {
                    fieldName: 'cuotaspendientes',
                    startValue: cuotaspendientesdesde,
                    endValue: cuotaspendienteshasta
                }
            ]
        };

        const searchQuery: ISearchField[] = [
            {
                fieldName: 'id',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'cliente',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'monto',
                fieldValue: search,
                exactMatch: true
            }
        ];

        const wp: WhereParam = new WhereParam(
            { eliminado, idcliente, estado },
            [
                { idgrupo, idservicio },
                { iddepartamento, iddistrito, idbarrio }
            ],
            rangeQuery,
            searchQuery,
            null
        );
        const queryGrupos: string = `SELECT idgrupo AS idreferencia, grupo AS referencia, COUNT(*) AS cantidad, SUM(deuda) AS monto
        FROM public.vw_suscripciones ${wp.whereStr}
        GROUP BY idgrupo, grupo
        ORDER BY grupo ASC`;
        const rowsGrupos: ResumenCantMonto[] = (await this.dbsrv.execute(queryGrupos, wp.whereParams)).rows;
        const queryServicios: string = `SELECT idservicio AS idreferencia, servicio AS referencia, idgrupo, COUNT(*) AS cantidad, SUM(deuda) AS monto
        FROM public.vw_suscripciones ${wp.whereStr}
        GROUP BY idservicio, servicio, idgrupo ORDER BY servicio DESC`;
        const rowsServicios = (await this.dbsrv.execute(queryServicios, wp.whereParams)).rows;
        rowsGrupos.forEach((rg: ResumenCantMonto) => {
            if (!rg.children) rg.children = [];
            for (let rs of rowsServicios) {
                if (rs.idgrupo == rg.idreferencia) rg.children.push(rs);
            }
        });
        return rowsGrupos;
    }

    async getResumenDepartamentosDistritos(params): Promise<ResumenCantMonto[]> {
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta,
            iddepartamento,
            iddistrito,
            idbarrio,
            search
        } = params;
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechasuscripcion::date',
                    startValue: fechainiciosuscripcion,
                    endValue: fechafinsuscripcion
                },
                {
                    fieldName: 'cuotaspendientes',
                    startValue: cuotaspendientesdesde,
                    endValue: cuotaspendienteshasta
                }
            ]
        };

        const searchQuery: ISearchField[] = [
            {
                fieldName: 'id',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'cliente',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'monto',
                fieldValue: search,
                exactMatch: true
            }
        ];

        const wp: WhereParam = new WhereParam(
            { eliminado, idcliente, estado },
            [
                { idgrupo, idservicio },
                { iddepartamento, iddistrito, idbarrio }
            ],
            rangeQuery,
            searchQuery,
            null
        );

        const queryDepartamentos: string = `SELECT iddepartamento AS idreferencia, departamento AS referencia, COUNT(*) as cantidad, SUM(deuda) AS monto
        FROM public.vw_suscripciones ${wp.whereStr}
        GROUP BY iddepartamento, departamento
        ORDER BY departamento ASC`;

        const queryDistritos: string = `SELECT iddepartamento, iddistrito AS idreferencia, distrito AS referencia, COUNT(*) as cantidad, SUM(deuda) AS monto
        FROM public.vw_suscripciones ${wp.whereStr}
        GROUP BY iddepartamento, iddistrito, distrito
        ORDER BY distrito ASC`;

        const rowsDepart: ResumenCantMonto[] = (await this.dbsrv.execute(queryDepartamentos, wp.whereParams)).rows;
        const rowsDistr = (await this.dbsrv.execute(queryDistritos, wp.whereParams)).rows;

        rowsDepart.forEach((rdep: ResumenCantMonto) => {
            rdep.children = [];
            if (Array.isArray(rowsDistr)) rowsDistr.forEach((rdis) => {
                if (rdep.idreferencia === rdis.iddepartamento) rdep.children.push(rdis);
            });
        });
        return rowsDepart;
    }

}
