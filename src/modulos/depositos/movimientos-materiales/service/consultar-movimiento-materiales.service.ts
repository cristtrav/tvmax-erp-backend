import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Material } from '@database/entity/depositos/material.entity';
import { MovimientoMaterial } from '@database/entity/depositos/movimiento-material.entity';
import { MovimientoMaterialView } from '@database/view/depositos/movimiento-material.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ConsultarMovimientoMaterialesService {

    constructor(
        @InjectRepository(MovimientoMaterial)
        private movimientoMaterialRepo: Repository<MovimientoMaterial>,
        @InjectRepository(Existencia)
        private existenciaRepo: Repository<Existencia>,
        @InjectRepository(MovimientoMaterialView)
        private movimientoMaterialViewRepo: Repository<MovimientoMaterialView>,
        @InjectRepository(DetalleMovimientoMaterial)
        private detalleMovimientoMaterialRepo: Repository<DetalleMovimientoMaterial>,
        @InjectRepository(Material)
        private materialRepo: Repository<Material>,
        @InjectRepository(MaterialIdentificable)
        private materialIdentificableRepo: Repository<MaterialIdentificable>,
        private datasource: DataSource
    ){ }

    private getSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<MovimientoMaterialView>{
        const {
            sort,
            offset,
            limit,
            eliminado,
            fechainicio,
            fechafin,
            tipomovimiento,
            idusuarioresponsable,
            idusuarioentrega,
            search
        } = queries;
        const alias = 'movimiento';
        let query = this.movimientoMaterialViewRepo.createQueryBuilder(alias);

        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if(fechainicio) query = query.andWhere(`${alias}.fecha >= :fechainicio`, {fechainicio});
        if(fechafin) query = query.andWhere(`${alias}.fecha <= :fechafin`, {fechafin});
        if(tipomovimiento)
            if(Array.isArray(tipomovimiento)) query = query.andWhere(`${alias}.tipomovimiento IN (:...tipomovimiento)`, {tipomovimiento});
            else query = query.andWhere(`${alias}.tipomovimiento = :tipomovimiento`, {tipomovimiento});
        if(idusuarioresponsable != null) query = query.andWhere(`${alias}.idusuarioresponsable = :idusuarioresponsable`, {idusuarioresponsable});
        if(idusuarioentrega != null) query = query.andWhere(`${alias}.idusuarioentrega = :idusuarioentrega`, {idusuarioentrega});
        if(search){
            if(Number.isInteger(Number(search))) query = query.andWhere(`${alias}.id = :idsearch`, {idsearch: Number(search)});
        }

        if(offset) query = query.skip(offset);
        if(limit) query = query.take(limit);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn !== 'id') query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: {[name: string]: any}): Promise<MovimientoMaterialView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    findById(id: number): Promise<MovimientoMaterialView>{
        return this.movimientoMaterialViewRepo.findOneByOrFail({ id });
    }

    async getLastId(queries: {[name: string]: any}): Promise<number>{
        const { eliminado } = queries;
        let query =
            this.movimientoMaterialRepo
            .createQueryBuilder('movimiento')
            .select('MAX(movimiento.id)', 'lastid');
        if(eliminado != null) query = query.andWhere(`movimiento.eliminado = :eliminado`, { eliminado });
        return (await query.getRawOne()).lastid;
    }

}
