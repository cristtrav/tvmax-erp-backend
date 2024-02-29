import { DetalleReclamoView } from '@database/view/reclamos/detalle-reclamo.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

type QueriesType = {[name: string]: any}

@Injectable()
export class DetallesReclamosService {

    constructor(
        @InjectRepository(DetalleReclamoView)
        private detallesReclamosViewRepo: Repository<DetalleReclamoView>
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<DetalleReclamoView>{
        const alias = 'detalle';
        const { idreclamo, eliminado } = queries;
        let query = this.detallesReclamosViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        if(idreclamo) query = query.andWhere(`${alias}.idreclamo = :idreclamo`, {idreclamo});
        return query;
    }

    findDetallesByReclamo(idreclamo: number, queries: QueriesType): Promise<DetalleReclamoView[]>{
        return this.getSelectQuery({idreclamo, ...queries}).getMany();
    }

}
