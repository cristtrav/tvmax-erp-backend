import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Barrio } from '@database/entity/barrio.entity';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { BarrioView } from '@database/view/barrio.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';

@Injectable()
export class BarriosService {

    constructor(
        @InjectRepository(Barrio)
        private barrioRepo: Repository<Barrio>,
        @InjectRepository(BarrioView)
        private barrioViewRepo: Repository<BarrioView>,
        private dataSource: DataSource,
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<BarrioView> {
        const { eliminado, iddistrito, iddepartamento, id, search, sort, offset, limit } = queries;
        const entityAlias: string = 'barrio';
        let queryBuilder: SelectQueryBuilder<BarrioView> = this.barrioViewRepo.createQueryBuilder(entityAlias);

        if (eliminado) queryBuilder = queryBuilder.andWhere(`${entityAlias}.eliminado = :eliminado`, { eliminado });
        if (id) queryBuilder = queryBuilder.andWhere(`${entityAlias}.id ${Array.isArray(id) ? 'IN (...:id)' : '= :id'}`, { id });
        if (iddistrito) queryBuilder = queryBuilder.andWhere(`${entityAlias}.iddistrito ${Array.isArray(iddistrito) ? 'IN (...:iddistrito)' : '= :iddistrito'}`, { iddistrito });
        if (iddepartamento) queryBuilder = queryBuilder.andWhere(`${entityAlias}.iddepartamento ${Array.isArray(iddepartamento) ? 'IN (...:iddepartamento)' : '= :iddepartamento'}`, { iddepartamento });
        if (search) {
            queryBuilder = queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb = qb.orWhere(`LOWER(${entityAlias}.descripcion) LIKE :descsearch`, { descsearch: `%${search.toLowerCase()}%` });
                    if (!Number.isNaN(Number(search))) qb = qb.orWhere(`${entityAlias}.id = :idsearch`, { idsearch: Number(search) });
                })
            );
        }
        if (offset) queryBuilder = queryBuilder.skip(offset);
        if (limit) queryBuilder = queryBuilder.take(limit);
        if (sort) {
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            const sortColumn: string = sort.substring(1);
            queryBuilder = queryBuilder.orderBy(`${entityAlias}.${sortColumn}`, sortOrder);
        }
        return queryBuilder;
    }

    private getEventoAuditoria(idusuario: number, operacion: "R" | "M" | "E", estadoanterior: any, estadonuevo: any): EventoAuditoria {
        const evento: EventoAuditoria = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.estadoanterior = estadoanterior;
        evento.estadonuevo = estadonuevo;
        evento.fechahora = new Date();
        evento.idtabla = TablasAuditoriaList.BARRIOS.id;
        return evento;
    }

    async findAll(queryParams: { [name: string]: any }): Promise<BarrioView[]> {
        return this.getSelectQuery(queryParams).getMany();
    }

    async count(queryParams): Promise<number> {
        return this.getSelectQuery(queryParams).getCount();
    }

    async create(b: Barrio, idusuario: number) {
        if (await this.barrioRepo.findOneBy({ id: b.id })) throw new HttpException({
            message: `El barrio con código «${b.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.dataSource.manager.transaction(async (manager) => {
            await manager.save(b);
            await manager.save(this.getEventoAuditoria(idusuario, "R", null, b));
        });
    }

    async findById(id: number): Promise<BarrioView> {
        return this.barrioViewRepo.findOneByOrFail({id});
    }

    async edit(oldId: number, b: Barrio, idusuario: number) {
        const oldBarrio: Barrio = await this.barrioRepo.findOneByOrFail({ id: oldId });
        await this.dataSource.manager.transaction(async (manager) => {
            await manager.save(b);
            await manager.save(this.getEventoAuditoria(idusuario, "M", oldBarrio, b));
            if (oldBarrio.id !== b.id) await manager.remove(oldBarrio);
        });
    }

    async delete(id: number, idusuario: number){
        const barrio: Barrio = await this.barrioRepo.findOneByOrFail({ id });
        const oldBarrio: Barrio = {...barrio};
        barrio.eliminado = true;

        await this.dataSource.manager.transaction(async (manager) => {
            await manager.save(barrio);
            await manager.save(this.getEventoAuditoria(idusuario, "E", oldBarrio, barrio));
        });
    }

    async getLastId(): Promise<number> {
        return (await this.barrioRepo.createQueryBuilder('barrio')
            .select('MAX(barrio.id)', 'lastid').getRawOne()).lastid;
    }

}
