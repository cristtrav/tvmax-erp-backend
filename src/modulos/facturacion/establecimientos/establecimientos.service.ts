import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class EstablecimientosService {

    constructor(
        @InjectRepository(Establecimiento)
        private establecimientosRepo: Repository<Establecimiento>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<Establecimiento>{
        const alias = 'estab';
        let query = this.establecimientosRepo.createQueryBuilder(alias);
        return query;
    }

    public async findAll(queries: QueriesType): Promise<Establecimiento[]>{
        return this.getSelectQuery(queries).getMany();
    }

    public async count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    public async findById(id: number): Promise<Establecimiento>{
        return this.establecimientosRepo.findOneBy({ id });
    }

    public async create(establecimiento: Establecimiento, idusuario: number){
        await this.datasource.transaction(async manager => {
            await manager.save(Establecimiento.getEventoAuditoria(idusuario, 'R', null, establecimiento));
            await manager.save(establecimiento);
        })
    }

    public async edit(oldId: number, establecimiento: Establecimiento, idusuario: number){
        const oldEstablecimiento = await this.establecimientosRepo.findOneBy({ id: oldId });
        await this.datasource.transaction(async manager => {
            await manager.save(Establecimiento.getEventoAuditoria(idusuario, 'M', oldEstablecimiento, establecimiento));
            await manager.save(establecimiento);
            if(oldId != establecimiento.id) await manager.remove(oldEstablecimiento);
        })
    }

    public async delete(id: number, idusuario: number){
        const oldEstablecimiento = await this.establecimientosRepo.findOneByOrFail({ id });
        await this.datasource.transaction(async manager => {
            await manager.save(Establecimiento.getEventoAuditoria(idusuario, 'E', oldEstablecimiento, null));
            await manager.remove(oldEstablecimiento);
        })
    }

}

type QueriesType = { [name: string]: any }
