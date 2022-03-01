import { Suscripcion } from '@dto/suscripcion.dto';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { IRangeQuery } from '@util/irangequery.interface';
import { WhereParam } from '@util/whereparam';
import { ISearchField } from '@util/isearchfield.interface';
import { ResumenCantMonto } from '@dto/resumen-cant-monto.dto';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';

@Injectable()
export class SuscripcionesService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams) {
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
        } = queryParams;

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
            { sort, offset, limit }
        );

        var query: string = `SELECT * FROM public.vw_suscripciones ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number> {
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
        } = queryParams;

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

        var query: string = `SELECT COUNT(*) FROM public.vw_suscripciones ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async getLastId(): Promise<number> {
        const query: string = `SELECT MAX(id) FROM public.suscripcion`;
        return (await this.dbsrv.execute(query)).rows[0].max;
    }

    async create(s: Suscripcion, idusuario: number) {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.suscripcion(id, monto, fecha_suscripcion, idcliente, iddomicilio, idservicio, estado, fecha_cambio_estado, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, false)`;
        const params: any[] = [s.id, s.monto, s.fechasuscripcion, s.idcliente, s.iddomicilio, s.idservicio, s.estado, s.fechacambioestado];
        try{
            await cli.query('BEGIN');
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.SUSCRIPCIONES, idusuario, s.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }        
    }

    async findById(id: number): Promise<Suscripcion> {
        const query: string = `SELECT * FROM public.vw_suscripciones WHERE id = $1`;
        const rows: Suscripcion[] = (await this.dbsrv.execute(query, [id])).rows;
        if (rows.length > 0) return rows[0];
        return null;
    }

    async edit(oldId: number, s: Suscripcion, idusuario: number): Promise<boolean> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.suscripcion SET id = $1, monto = $2, fecha_suscripcion = $3, idcliente = $4, iddomicilio = $5, idservicio = $6, estado = $7, fecha_cambio_estado = $8 WHERE id = $9`;
        const params: any[] = [s.id, s.monto, s.fechasuscripcion, s.idcliente, s.iddomicilio, s.idservicio, s.estado, s.fechacambioestado, oldId];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.SUSCRIPCIONES, idusuario, oldId);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.SUSCRIPCIONES, idevento, s.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount > 0;
    }

    async delete(id: number, idusuario: number): Promise<boolean> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.suscripcion SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.SUSCRIPCIONES, idusuario, id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        
        return rowCount > 0;
    }

    async findSuscripcionesPorCliente(idcliente: number, params): Promise<Suscripcion[]> {
        const { eliminado, sort, offset, limit } = params;
        const wp: WhereParam = new WhereParam(
            { idcliente, eliminado },
            null,
            null,
            null,
            { sort, offset, limit }
        );
        const query: string = `SELECT * FROM public.vw_suscripciones ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countSuscripcionesPorCliente(idcliente, params): Promise<number> {
        const { eliminado } = params;
        const wp: WhereParam = new WhereParam(
            { eliminado },
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_suscripciones ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
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

    async getResumenGruposServicios(params): Promise<ResumenCantMonto[]>{
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
        rowsGrupos.forEach((rg: ResumenCantMonto)=>{
            if(!rg.children) rg.children = [];
            for(let rs of rowsServicios){
                if(rs.idgrupo == rg.idreferencia) rg.children.push(rs);
            }
        });
        return rowsGrupos;
    }

    async getResumenDepartamentosDistritos(params): Promise<ResumenCantMonto[]>{
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

        rowsDepart.forEach((rdep: ResumenCantMonto)=>{
            rdep.children = [];
            if(Array.isArray(rowsDistr)) rowsDistr.forEach((rdis)=>{
                if(rdep.idreferencia === rdis.iddepartamento) rdep.children.push(rdis);
            });
        });
        return rowsDepart;
    }

}
