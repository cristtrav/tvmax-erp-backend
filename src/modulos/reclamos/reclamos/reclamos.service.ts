import { DetalleReclamo } from '@database/entity/reclamos/detalle-reclamo.entity';
import { Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';
import { ReclamoView } from '@database/view/reclamos/reclamo.view';
import { DetalleReclamoDTO } from '@dto/reclamos/detalle-reclamo.dto';
import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

type QueriesType = {[name: string]: any}

@Injectable()
export class ReclamosService implements OnModuleInit {

    constructor(
        @InjectRepository(ReclamoView)
        private reclamoViewRepo: Repository<ReclamoView>,
        @InjectRepository(Reclamo)
        private reclamoRepo: Repository<Reclamo>,
        @InjectRepository(TablaAuditoria)
        private tablaAuditoriaRepo: Repository<TablaAuditoria>,
        private datasource: DataSource
    ){}

    async onModuleInit() {
        if(!await this.tablaAuditoriaRepo.findOneBy({id: Reclamo.TABLA_AUDITORIA.id}))
            await this.tablaAuditoriaRepo.save(Reclamo.TABLA_AUDITORIA);
        if(!await this.tablaAuditoriaRepo.findOneBy({id: DetalleReclamo.TABLA_AUDITORIA.id}))
            await this.tablaAuditoriaRepo.save(DetalleReclamo.TABLA_AUDITORIA);
    }

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<ReclamoView>{
        const { eliminado, sort, offset, limit } = queries;
        const alias = 'reclamo';
        let query = this.reclamoViewRepo.createQueryBuilder(alias);
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

    findAll(queries: QueriesType): Promise<ReclamoView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    async create(reclamo: Reclamo, detalles: DetalleReclamoDTO[], idusuario: number): Promise<number> {
        let idreclamo: number = -1;
        await this.datasource.transaction(async manager => {
            reclamo.fechaHoraCambioEstado = new Date();
            reclamo.idusuarioRegistro = idusuario;
            idreclamo = (await manager.save(reclamo)).id;
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'R', null, reclamo));

            for(let detalle of detalles){
                delete detalle.id;
                detalle.idreclamo = idreclamo;
                await manager.save(detalle);
                await manager.save(DetalleReclamo.getEventoAuditoria(idusuario, 'R', null, detalle));
            }
        })
        return idreclamo;
    }

    async delete(idreclamo: number, idusuario: number){
        const reclamo = await this.reclamoRepo.findOne({
            where: { id: idreclamo, eliminado: false},
            relations: { detalles: true }
        });
        
        if(!reclamo) throw new HttpException({
            message: `No se encuentra el reclamo con código «${idreclamo}».`
        }, HttpStatus.NOT_FOUND);

        const oldReclamo = { ...reclamo };

        await this.datasource.transaction(async manager => {
            reclamo.eliminado = true;
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'E', oldReclamo, reclamo));
            for(let detalle of reclamo.detalles){
                const oldDetalle = { ...detalle };
                detalle.eliminado = false;
                await manager.save(detalle);
                await manager.save(DetalleReclamo.getEventoAuditoria(idusuario, 'E', oldDetalle, detalle));
            }
        })
    }

}
