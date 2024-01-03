import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
        private datasource: DataSource
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
            search,
            gentileza,
            idcobrador,
            fechainiciocambioestado,
            fechafincambioestado,
        } = queries;        
        const alias = 'suscripcion';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias);

        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (gentileza != null) query = query.andWhere(`${alias}.gentileza = :gentileza`, { gentileza });
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

        if (estado)
            if (Array.isArray(estado)) query = query.andWhere(`${alias}.estado IN (:...estado)`, { estado });
            else query = query.andWhere(`${alias}.estado = :estado`, { estado });

        if (fechainiciosuscripcion) query = query.andWhere(`${alias}.fechasuscripcion >= :fechainiciosuscripcion`, { fechainiciosuscripcion: new Date(`${fechainiciosuscripcion}T00:00:00`) });
        if (fechafinsuscripcion) query = query.andWhere(`${alias}.fechasuscripcion <= :fechafinsuscripcion`, { fechafinsuscripcion: new Date(`${fechafinsuscripcion}T00:00:00`) });
        if (cuotaspendientesdesde) query = query.andWhere(`${alias}.cuotaspendientes >= :cuotaspendientesdesde`, { cuotaspendientesdesde });
        if (cuotaspendienteshasta) query = query.andWhere(`${alias}.cuotaspendientes <= :cuotaspendienteshasta`, { cuotaspendienteshasta });
        if (idcobrador) query = query.andWhere(`${alias}.idcobrador = :idcobrador`, { idcobrador });
        if (fechainiciocambioestado) query = query.andWhere(`${alias}.fechacambioestado >= :fechainiciocambioestado`, { fechainiciocambioestado });
        if (fechafincambioestado) query = query.andWhere(`${alias}.fechacambioestado <= :fechafincambioestado`, { fechafincambioestado });
        if (search) {
            query = query.andWhere(new Brackets(qb => {
                if (Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, { idsearch: search });
                if (Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.ci = :idsearch`, { idsearch: search });
                qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :clisearch`, { clisearch: `%${search.toLowerCase()}%` });
                qb = qb.orWhere(`LOWER(${alias}.nromedidor) LIKE :nromedidorsearch`, { nromedidorsearch: `%${search.toLowerCase()}%`})
            }));
        }
        if (limit) query = query.take(limit);
        if (offset) query = query.skip(offset);
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getEventoAuditoria(idusuario, operacion: 'R' | 'M' | 'E', oldValue: any, newValue: any): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.fechahora = new Date();
        evento.idtabla = TablasAuditoriaList.SUSCRIPCIONES.id;
        evento.operacion = operacion;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        evento.idusuario = idusuario;
        return evento;
    }

    findAll(queries: { [name: string]: any }): Promise<SuscripcionView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async getLastId(): Promise<number> {
        return (await this.suscripcionViewRepo.createQueryBuilder('suscripcion')
            .select('MAX(suscripcion.id)', 'lastid')
            .getRawOne()).lastid;
    }

    async create(s: Suscripcion, idusuario: number) {
        const oldSuscripcion = await this.suscripcionRepo.findOneBy({ id: s.id });

        if (oldSuscripcion && !oldSuscripcion.eliminado) throw new HttpException({
            message: `La suscripción con código «${s.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(s);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', oldSuscripcion, s));
        });
    }

    findById(id: number): Promise<SuscripcionView> {
        return this.suscripcionViewRepo.findOneByOrFail({ id });
    }

    async edit(oldId: number, s: Suscripcion, idusuario: number) {
        const oldSuscripcion = await this.suscripcionRepo.findOneByOrFail({ id: oldId });

        if (oldId != s.id && await this.suscripcionRepo.findOneBy({ id: s.id, eliminado: false })) throw new HttpException({
            message: `La suscripción con código «${s.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(s);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldSuscripcion, s));
            if (oldId != s.id) await manager.remove(oldSuscripcion);
        });
    }

    async delete(id: number, idusuario: number) {
        const suscripcion = await this.suscripcionRepo.findOneByOrFail({ id });
        const oldSuscripcion = { ...suscripcion };
        suscripcion.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(suscripcion);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldSuscripcion, suscripcion));
        });
    }

}
