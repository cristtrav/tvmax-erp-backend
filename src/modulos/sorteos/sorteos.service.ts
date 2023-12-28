import { Sorteo } from '@database/entity/sorteos/sorteo.entity';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class SorteosService {

    constructor(
        @InjectRepository(Sorteo)
        private sorteoRepo: Repository<Sorteo>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<Sorteo>{
        const { eliminado, sort, offset, limit } = queries;
        const alias = 'sorteo';
        let query = this.sorteoRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn != 'id') query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: QueriesType): Promise<Sorteo[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    findById(id: number): Promise<Sorteo>{
        return this.sorteoRepo.findOneByOrFail({id});
    }

    async create(sorteo: Sorteo, idusuario: number){
        const oldSorteo = await this.sorteoRepo.findOneBy({id: sorteo.id});
        if(oldSorteo && !oldSorteo.eliminado) throw new HttpException({
            message: `El sorteo con código «${sorteo.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST)

        await this.datasource.transaction(async manager => {
            await manager.save(sorteo);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaSorteos(idusuario, 'R', oldSorteo, sorteo));
        });
    }

    async update(oldId: number, sorteo: Sorteo, idusuario: number){
        const oldSorteo = await this.sorteoRepo.findOneByOrFail({id: oldId});

        if(oldId != sorteo.id && await this.sorteoRepo.findOneBy({id: sorteo.id})) throw new HttpException({
            message: `El código de sorteo «${sorteo.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(EventoAuditoriaUtil.getEventoAuditoria(TablasAuditoriaList.SORTEOS.id, idusuario, 'M', oldSorteo, sorteo));
            await manager.save(oldSorteo);
            await manager.save(sorteo);
        });
    }

    async delete(id: number, idusuario: number){
        const sorteo = await this.sorteoRepo.findOneByOrFail({id});
        const oldSorteo = {...sorteo};
        sorteo.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(EventoAuditoriaUtil.getEventoAuditoria(TablasAuditoriaList.SORTEOS.id, idusuario, 'E', oldSorteo, sorteo));
            await manager.save(sorteo);
        });
    }

    async getLastId(): Promise<number>{
        return (await this.sorteoRepo
            .createQueryBuilder('sorteo')
            .select('MAX(sorteo.id)', 'max')
            .getRawOne()
        ).max;
    }
}

type QueriesType = {[name: string]: any};
