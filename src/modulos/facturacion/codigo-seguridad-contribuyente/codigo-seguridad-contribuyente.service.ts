import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class CodigoSeguridadContribuyenteService {

    constructor(
        @InjectRepository(CodigoSeguridadContribuyente)
        private cscRepo: Repository<CodigoSeguridadContribuyente>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<CodigoSeguridadContribuyente>{
        const alias = 'csc';
        const { activo } = queries;
        let query = this.cscRepo.createQueryBuilder(alias);
        if(activo != null) query = query.andWhere(`${alias}.activo = :activo`, { activo });
        return query;
    }

    public async findAll(queries: QueriesType): Promise<CodigoSeguridadContribuyente[]>{
        return this.getSelectQuery(queries).getMany();
    }

    public async count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    async findActivo(): Promise<CodigoSeguridadContribuyente>{
        return this.cscRepo.findOneByOrFail({activo: true});
    }

    async findById(id: number): Promise<CodigoSeguridadContribuyente>{
        return this.cscRepo.findOneByOrFail({ id });
    }

    async create(csc: CodigoSeguridadContribuyente, idusuario: number){
        await this.datasource.transaction(async manager => {
            await manager.save(CodigoSeguridadContribuyente.getEventoAuditoria(idusuario, 'R', null, csc));
            await manager.save(csc);
        })
    }

    async edit(oldId, csc: CodigoSeguridadContribuyente, idusuario: number){
        const oldCsc = await this.cscRepo.findOneByOrFail({ id: oldId });
        await this.datasource.transaction(async manager => {
            await manager.save(CodigoSeguridadContribuyente.getEventoAuditoria(idusuario, 'M', oldCsc, csc));
            await manager.save(csc);
            if(oldId != csc.id) await manager.remove(oldCsc);
        })
    }

    async delete(id: number, idusuario: number){
        const oldCsc = await this.cscRepo.findOneByOrFail({ id: id });
        await this.datasource.transaction(async manager => {
            await manager.save(CodigoSeguridadContribuyente.getEventoAuditoria(idusuario, 'E', oldCsc, null));
            await manager.remove(oldCsc);
        })
    }

}

type QueriesType = {[name: string]: any}
