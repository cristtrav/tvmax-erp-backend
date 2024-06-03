import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';
import { EventoAuditoriaView } from '@database/view/evento-auditoria.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class AuditoriaService {

    constructor(
        @InjectRepository(EventoAuditoriaView)
        private eventoAuditoriaViewRepo: Repository<EventoAuditoriaView>,
        @InjectRepository(TablaAuditoria)
        private tablaAuditoriaRepo: Repository<TablaAuditoria>
    ) { }

    private getSelectQueryEvento(queries: { [name: string]: any }): SelectQueryBuilder<EventoAuditoriaView> {
        const alias = 'evento';
        const { offset, limit, sort, idusuario, idtabla, fechahoradesde, fechahorahasta, operacion, search } = queries;
        let query = this.eventoAuditoriaViewRepo.createQueryBuilder(alias);
        if (idusuario)
            if (Array.isArray(idusuario)) query = query.andWhere(`${alias}.idusuario IN (:...idusuario)`, { idusuario });
            else query = query.andWhere(`${alias}.idusuario = :idusuario`, { idusuario });
        if (idtabla)
            if (Array.isArray(idtabla)) query = query.andWhere(`${alias}.idtabla IN (:...idtabla)`, { idtabla });
            else query = query.andWhere(`${alias}.idtabla = :idtabla`, { idtabla });
        if (operacion)
            if (Array.isArray(operacion)) query = query.andWhere(`${alias}.operacion IN (:...operacion)`, { operacion })
            else query = query.andWhere(`${alias}.operacion = :operacion`, { operacion });
        if (fechahoradesde) query = query.andWhere(`${alias}.fechahora >= :fechahoradesde`, { fechahoradesde });
        if (fechahorahasta) query = query.andWhere(`${alias}.fechahora <= :fechahorahasta`, { fechahorahasta });
        if (search) {
            query = query.andWhere(new Brackets(qb => {
                if(!Number.isNaN(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, { idsearch: search });
                qb = qb.orWhere(`LOWER(${alias}.nombresusuario) LIKE :nombressearch`, { nombressearch: `%${search.toLowerCase()}%` });
                qb = qb.orWhere(`LOWER(${alias}.apellidosusuario) LIKE :apellidossearch`, { apellidossearch: `%${search.toLowerCase()}%` });
                qb = qb.orWhere(`LOWER(${alias}.tabla) LIKE :tablasearch`, { tablasearch: `%${search.toLowerCase()}%` });
            }));
        }
        if (offset) query = query.skip(offset);
        if (limit) query = query.take(limit);
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getSelectQueryTabla(queries: { [name: string]: any }): SelectQueryBuilder<TablaAuditoria> {
        const { sort, offset, limit } = queries;
        const alias = 'tabla'
        let query = this.tablaAuditoriaRepo.createQueryBuilder(alias);
        if (offset) query = query.skip(offset);
        if (limit) query = query.take(limit);
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    findAllEventos(queries: { [name: string]: any }): Promise<EventoAuditoriaView[]> {
        return this.getSelectQueryEvento(queries).getMany();
    }

    countEventos(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQueryEvento(queries).getCount();
    }

    async findAllTablas(queries: { [name: string]: any }): Promise<TablaAuditoria[]> {
        return this.getSelectQueryTabla(queries).getMany();
    }

    async countTablas(queries: {[name: string]: any}): Promise<number> {
        return this.getSelectQueryTabla(queries).getCount();
    }
}
