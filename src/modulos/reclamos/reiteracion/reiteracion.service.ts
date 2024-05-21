import { Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { Reiteracion } from '@database/entity/reclamos/reiteracion.entity';
import { ReiteracionView } from '@database/view/reclamos/reiteracion.view';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

type QueriesType = {[name: string]: any}

@Injectable()
export class ReiteracionService {
 
    constructor(
        @InjectRepository(Reiteracion)
        private reiteracionRepo: Repository<Reiteracion>,
        @InjectRepository(ReiteracionView)
        private reiteracionViewRepo: Repository<ReiteracionView>,
        @InjectRepository(Reclamo)
        private reclamoRepo: Repository<Reclamo>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<ReiteracionView>{
        const { eliminado, idreclamo, sort } = queries;
        const alias = 'reiteracion';
        let query = this.reiteracionViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        if(idreclamo) query = query.andWhere(`${alias}.idreclamo = :idreclamo`, {idreclamo});
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn != 'id') query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: QueriesType): Promise<ReiteracionView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    async create(reiteracion: Reiteracion, idusuario: number){
        const reclamo = await this.reclamoRepo.findOneByOrFail({id: reiteracion.idreclamo});

        if(reclamo.estado == 'PRO') throw new HttpException({
            message: `El reclamo se encuentra en proceso`
        }, HttpStatus.BAD_REQUEST);

        if(reclamo.estado == 'FIN') throw new HttpException({
            message: 'El reclamo está finalizado'
        }, HttpStatus.BAD_REQUEST);

        if(reclamo.estado == 'OTR') throw new HttpException({
            message: `El reclamo se encuentra en estado «${reclamo.observacionEstado}»`
        }, HttpStatus.BAD_REQUEST);

        const oldReclamo = { ... reclamo };
        reclamo.motivoReiteracion = reiteracion.observacion;
        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));
            await manager.save(reiteracion);
            await manager.save(Reiteracion.getEventoAuditoria(idusuario, 'R', null, reiteracion));
        });
    }

    async edit(oldId: number, reiteracion: Reiteracion, idusuario: number){
        const oldReiteracion = await this.reiteracionRepo.findOneByOrFail({id: oldId});
        
        if(await this.reiteracionRepo.findOneBy({id: reiteracion.id})) throw new HttpException({
            message: `La reiteración con código «${reiteracion.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);
        
        await this.datasource.transaction(async manager => {
            await manager.save(reiteracion);
            await manager.save(Reiteracion.getEventoAuditoria(idusuario, 'M', oldReiteracion, reiteracion));
            if(oldId != reiteracion.id) await manager.remove(oldReiteracion);
        })
    }

    async delete(id: number, idusuario: number){
        const reiteracion = await this.reiteracionRepo.findOneByOrFail({id});
        const oldReiteracion = { ...reiteracion };
        const reclamo = await this.reclamoRepo.findOneByOrFail({id: reiteracion.idreclamo});
        const oldReclamo = { ...reclamo };

        const ultReiteracion =
            await this.reiteracionRepo
            .createQueryBuilder('reiteracion')
            .where(`reiteracion.idreclamo = :idreclamo`, {idreclamo: reclamo.id})
            .andWhere(`reiteracion.id != :id`, {id})
            .andWhere(`reiteracion.eliminado = FALSE`)
            .orderBy(`reiteracion.id`, 'DESC')
            .getOne();
        
        reiteracion.eliminado = true;
        reclamo.motivoReiteracion = ultReiteracion ? ultReiteracion.observacion : null;
        await this.datasource.transaction(async manager => {
            await manager.save(reiteracion);
            await manager.save(Reiteracion.getEventoAuditoria(idusuario, 'E', oldReiteracion, reiteracion));

            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));
        });
    }
    
}
