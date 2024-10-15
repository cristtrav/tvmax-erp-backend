import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ActividadEconomicaService {

    constructor(
        @InjectRepository(ActividadEconomica)
        private actividadEconomicaRepo: Repository<ActividadEconomica>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<ActividadEconomica>{
        const { limit, offset, sort } = queries;
        const alias = "actividad";
        let query = this.actividadEconomicaRepo.createQueryBuilder(alias);
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(limit);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(sortColumn, sortOrder);
        }
        return query;
    }

    public findAll(queries: {[name: string]: any}): Promise<ActividadEconomica[]>{
        return this.getSelectQuery(queries).getMany();
    }

    public count(queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    public findById(id: number): Promise<ActividadEconomica>{
        return this.actividadEconomicaRepo.findOneByOrFail({ id });
    }

    public async create(actividad: ActividadEconomica, idusuario: number){
        await this.datasource.transaction(async manager => {
            await manager.save(ActividadEconomica.getEventoAuditoria(idusuario, 'R', null, actividad))
            await manager.save(actividad);
        })
    }

    public async edit(oldId: number, actividad: ActividadEconomica, idusuario: number){
        const oldActividad = await this.actividadEconomicaRepo.findOneBy({id: oldId});
        await this.datasource.transaction(async manager => {
            await manager.save(ActividadEconomica.getEventoAuditoria(idusuario, 'M', oldActividad, actividad));
            await manager.save(actividad);
            if(actividad.id != oldId) await manager.remove(oldActividad);
        })
    }

    public async delete(id: number, idusuario: number){
        const oldActividad = await this.actividadEconomicaRepo.findOneBy({ id });
        await this.datasource.transaction(async manager => {
            await manager.save(ActividadEconomica.getEventoAuditoria(idusuario, 'E', oldActividad, null));
            await manager.remove(oldActividad);
        })
    }

}
