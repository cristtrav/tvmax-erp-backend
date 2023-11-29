import { DetalleMovimientoMaterial } from '@database/entity/detalle-movimiento-material.entity';
import { Existencia } from '@database/entity/existencia.entity';
import { MovimientoMaterial } from '@database/entity/movimiento-material.entity';
import { MovimientoMaterialView } from '@database/view/movimiento-material.view';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class MovimientosMaterialesService {

    constructor(
        @InjectRepository(MovimientoMaterial)
        private movimientoMaterialRepo: Repository<MovimientoMaterial>,
        @InjectRepository(Existencia)
        private existenciaRepo: Repository<Existencia>,
        @InjectRepository(MovimientoMaterialView)
        private movimientoMaterialViewRepo: Repository<MovimientoMaterialView>,
        @InjectRepository(DetalleMovimientoMaterial)
        private detalleMovimientoMaterialRepo: Repository<DetalleMovimientoMaterial>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<MovimientoMaterialView>{
        const { sort, offset, limit, eliminado } = queries;
        const alias = 'movimiento';
        let query = this.movimientoMaterialViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
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

    async create(movimiento: MovimientoMaterial, detalles: DetalleMovimientoMaterial[], idusuario: number): Promise<number>{
        let idmovimiento = -1;
        delete movimiento.id;
        if(movimiento.tipoMovimiento == 'AJ') movimiento.idusuarioEntrega = null;
        
        await this.datasource.transaction(async manager => {
            movimiento.devuelto = false;
            idmovimiento = (await manager.save(movimiento)).id;
            if(movimiento.tipoMovimiento == 'DE'){
                const movimientoReferencia = await this.movimientoMaterialRepo.findOneByOrFail({id: movimiento.idmovimientoReferencia});
                movimientoReferencia.devuelto = true;
                movimientoReferencia.idmovimientoReferencia = idmovimiento;
                await manager.save(movimientoReferencia);
            }
            for(let detalle of detalles){
                delete detalle.id
                detalle.movimiento = movimiento;

                const existencia = await this.existenciaRepo.findOneByOrFail({idmaterial: detalle.idmaterial});
                
                detalle.cantidadAnterior = existencia.cantidad;
                const iddetalle = (await manager.save(detalle)).id;

                if(movimiento.tipoMovimiento === 'EN' || movimiento.tipoMovimiento === 'DE') existencia.cantidad = `${Number(existencia.cantidad) + Number(detalle.cantidad)}`;
                if(movimiento.tipoMovimiento === 'SA') existencia.cantidad = `${Number(existencia.cantidad) - Number(detalle.cantidad)}`;
                if(movimiento.tipoMovimiento === 'AJ') existencia.cantidad = `${detalle.cantidad}`;

                await manager.save(existencia);
                if(movimiento.tipoMovimiento == 'DE'){
                    const detalleReferencia = await this.detalleMovimientoMaterialRepo.findOneByOrFail({id: detalle.iddetalleMovimientoReferencia});
                    detalleReferencia.iddetalleMovimientoReferencia = iddetalle;
                    await manager.save(detalleReferencia);
                }
            }
        });
        return idmovimiento;
    }

    async update(movimiento: MovimientoMaterial, detalles: DetalleMovimientoMaterial[], idusuario: number){
        const mov = await this.movimientoMaterialRepo.findOneByOrFail({id: movimiento.id});
        if(movimiento.tipoMovimiento == 'AJ') delete movimiento.idusuarioEntrega;

        await this.datasource.transaction(async manager => {
            await manager.save(movimiento);
            for(let deta of detalles){
                const existencia = await this.existenciaRepo.findOneByOrFail({idmaterial: deta.idmaterial});
                const detaAnterior = await this.detalleMovimientoMaterialRepo.findOneByOrFail({id: deta.id});
                deta.cantidadAnterior = existencia.cantidad;
                
                if(movimiento.tipoMovimiento == 'EN' || movimiento.tipoMovimiento == 'DE')
                    existencia.cantidad = `${(Number(existencia.cantidad) - Number(detaAnterior.cantidad) + Number(deta.cantidad))}`;
                if(movimiento.tipoMovimiento == 'SA')
                    existencia.cantidad = `${(Number(existencia.cantidad) + Number(detaAnterior.cantidad) - Number(deta.cantidad))}`;
                if(movimiento.tipoMovimiento == 'AJ')
                    existencia.cantidad = deta.cantidad;
                
                await manager.save(existencia);
                await manager.save(deta);
            }
        })
    }

    async delete(id: number, idusuario: number){
        const movimiento: MovimientoMaterial = await this.movimientoMaterialRepo
            .createQueryBuilder('movimiento')
            .where(`movimiento.id = :id`, {id})
            .andWhere(`movimiento.eliminado = FALSE`)
            .leftJoinAndSelect(`movimiento.detalles`, `detalle`, 'detalle.eliminado = FALSE')
            .getOne();

        if(!movimiento) throw new HttpException({
            message: `No se encontró el movimiento de material con código «${movimiento.id}».`
        }, HttpStatus.NOT_FOUND);

        await this.datasource.transaction(async manager => {
            if(movimiento.idmovimientoReferencia != null){
                const movimientoReferencia = await this.movimientoMaterialRepo.findOneByOrFail({id: movimiento.idmovimientoReferencia});
                movimientoReferencia.idmovimientoReferencia = null;
                movimientoReferencia.devuelto = false;
                await manager.save(movimientoReferencia);
            }

            movimiento.eliminado = true;
            await manager.save(movimiento);

            for(let detalle of movimiento.detalles){
                if(detalle.iddetalleMovimientoReferencia != null){
                    const detalleReferencia = await this.detalleMovimientoMaterialRepo.findOneByOrFail({id: detalle.iddetalleMovimientoReferencia});
                    detalleReferencia.iddetalleMovimientoReferencia = null;
                    await manager.save(detalleReferencia);
                }
                detalle.eliminado = true;
                await manager.save(detalle);

                const existencia = await this.existenciaRepo.findOneByOrFail({idmaterial: detalle.idmaterial});
                if(movimiento.tipoMovimiento === 'SA') existencia.cantidad = `${Number(existencia.cantidad) + Number(detalle.cantidad)}`;
                if(movimiento.tipoMovimiento === 'EN' || movimiento.tipoMovimiento === 'DE') existencia.cantidad = `${Number(existencia.cantidad) - Number(detalle.cantidad)}`;
                if(movimiento.tipoMovimiento === 'AJ') existencia.cantidad = detalle.cantidadAnterior;
                await manager.save(existencia);
            }
        });
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
