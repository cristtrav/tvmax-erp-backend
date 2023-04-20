import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { Grupo } from '@database/entity/grupo.entity';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class GruposService {

    constructor(
        @InjectRepository(Grupo)
        private grupoRepo: Repository<Grupo>,
        private dataSource: DataSource
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<Grupo> {
        const { eliminado, id, search, sort, offset, limit } = queries;
        const alias: string = 'grupo';
        let queryBuilder: SelectQueryBuilder<Grupo> = this.grupoRepo.createQueryBuilder(alias);
        if (eliminado != null) queryBuilder = queryBuilder.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (id) queryBuilder = queryBuilder.andWhere(`${alias}.id ${Array.isArray(id) ? 'IN (:...id)' : '= :id'}`, { id });
        if (offset) queryBuilder = queryBuilder.skip(offset);
        if (limit) queryBuilder = queryBuilder.take(limit);
        if (sort) {
            const sortColumn: string = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            queryBuilder = queryBuilder.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        if (search) {
            queryBuilder = queryBuilder.andWhere(new Brackets((qb) => {
                qb = qb.orWhere(`LOWER(${alias}.descripcion) LIKE :descsearch`, { descsearch: `%${search.toLowerCase()}%` });
                if (!Number.isNaN(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, { idsearch: Number(search) });
            }));
        }
        return queryBuilder;
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', estadoanterior: any, estadonuevo: any): EventoAuditoria{
        const evento: EventoAuditoria = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.fechahora = new Date();
        evento.idtabla = TablasAuditoriaList.GRUPOS.id;
        evento.operacion = operacion;
        evento.estadoanterior = estadoanterior;
        evento.estadonuevo = estadonuevo;
        return evento;
    }

    async findAll(queries: { [name: string]: any }): Promise<Grupo[]> {
        return this.getSelectQuery(queries).getMany();
    }

    async count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async findById(id: number): Promise<Grupo> {
        return this.grupoRepo.findOneByOrFail({id});
    }

    async create(g: Grupo, idusuario: number) {
        await this.dataSource.manager.transaction(async (manager) => {
            await manager.save(g);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', null, g));
        });
    }

    async update(idviejo: number, g: Grupo, idusuario: number) {
        const oldGrupo: Grupo = await this.grupoRepo.findOneByOrFail({id: idviejo});

        await this.dataSource.manager.transaction(async (manager)=>{
            await manager.save(g);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldGrupo, g));
            if(oldGrupo.id !== g.id) await manager.remove(oldGrupo);
        });
    }

    async delete(id: number, idusuario: number) {
        const grupo: Grupo = await this.grupoRepo.findOneByOrFail({id});
        const oldGrupo: Grupo = {...grupo};
        grupo.eliminado = true;

        await this.dataSource.manager.transaction(async (manager)=>{
            await manager.save(grupo);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldGrupo, grupo));
        });
    }

    async getLastId(): Promise<number> {
        return (await this.grupoRepo.createQueryBuilder('grupo')
        .select('MAX(grupo.id)', 'lastid').getRawOne()).lastid;
    }

}
