import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { TipoMaterial } from '@database/entity/tipo-material.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';


@Injectable()
export class TiposMaterialesService {

    constructor(
        @InjectRepository(TipoMaterial)
        private tipoMaterialRepo: Repository<TipoMaterial>,        
        private datasource: DataSource
    ){}

    getSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<TipoMaterial>{
        const {sort, offset, limit, eliminado } = queries;
        const alias = "tipomaterial";
        let query = this.tipoMaterialRepo.createQueryBuilder(alias);
        if(eliminado) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort){
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn !== 'id') query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: {[name: string]: any}): Promise<TipoMaterial[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    async getLastId(): Promise<number>{
        return (
            await this.tipoMaterialRepo
            .createQueryBuilder('tipomaterial')
            .select(`MAX(tipomaterial.id)`, 'max')
            .getRawOne()
        ).max;
    }

    findById(id: number): Promise<TipoMaterial> {
        return this.tipoMaterialRepo.findOneByOrFail({ id });
    }

    async create(tm: TipoMaterial, idusuario: number){
        const oldTipoMaterial = await this.tipoMaterialRepo.findOneBy({id: tm.id});
        if(oldTipoMaterial) throw new HttpException({
            message: `Un tipo de material con código ${tm.id} ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.manager.transaction(async manager => {
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaTiposMateriales(idusuario, 'R', oldTipoMaterial, tm));
            await manager.save(tm);
        })
    }

    async update(oldId: number, tm: TipoMaterial, idusuario: number){
        const oldTipoMaterial = await this.tipoMaterialRepo.findOneByOrFail({id: oldId});
        
        if(oldId != tm.id && await this.tipoMaterialRepo.findOneBy({id: tm.id, eliminado: false})) throw new HttpException({
            message: `El Tipo de Material con código «${tm.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(tm);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaTiposMateriales(idusuario, 'M', oldTipoMaterial, tm));
        });
    }

    async delete(id: number, idusuario: number){
        const tipoMaterial = await this.tipoMaterialRepo.findOneByOrFail({ id });
        const oldTipoMaterial = { ...tipoMaterial };
        tipoMaterial.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(tipoMaterial);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaTiposMateriales(idusuario, 'E', oldTipoMaterial, tipoMaterial));
        })
    }

}
