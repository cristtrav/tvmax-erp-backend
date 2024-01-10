
import { DetalleMovimientoMaterialView } from '@database/view/depositos/detalle-movimiento-material.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class DetallesMovimientosMaterialesService {

    constructor(
        @InjectRepository(DetalleMovimientoMaterialView)
        private detalleMovimientoMaterialViewRepo: Repository<DetalleMovimientoMaterialView>
    ){}

    private getSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<DetalleMovimientoMaterialView>{
        const { sort, offset, limit, eliminado, idmovimientomaterial } = queries;
        const alias = 'detalle';
        let query = this.detalleMovimientoMaterialViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if(idmovimientomaterial) query = query.andWhere(`${alias}.idmovimientomaterial = :idmovimientomaterial`, { idmovimientomaterial });
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn !== 'id') query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findByIdMovimiento(idmovimientomaterial: number, queries: {[name: string]: any}): Promise<DetalleMovimientoMaterialView[]>{
        return this.getSelectQuery({idmovimientomaterial, ...queries}).getMany();
    }

    countByIdMovimiento(idmovimientomaterial: number, queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery({idmovimientomaterial, ...queries}).getCount();
    }

    findAll(queries: {[name: string]: any}): Promise<DetalleMovimientoMaterialView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }
}