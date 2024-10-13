import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class DetallesVentasService {

    constructor(
        @InjectRepository(DetalleVentaView)
        private detalleVentaViewRepo: Repository<DetalleVentaView>
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<DetalleVentaView> {
        const { eliminado, idventa } = queries;
        const alias = 'detalle';
        let query = this.detalleVentaViewRepo.createQueryBuilder(alias);
        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (idventa)
            if (Array.isArray(idventa)) query = query.andWhere(`${alias}.idventa IN (:...idventa)`, { idventa });
            else query = query.andWhere(`${alias}.idventa = :idventa`, {idventa});
        return query;
    }

    async findByIdVenta(idventa: number): Promise<DetalleVentaView[]> {
        return this.getSelectQuery({idventa, eliminado: false}).getMany();
    }

    async countByIdVenta(idventa: number): Promise<number> {
        return this.getSelectQuery({idventa, eliminado: false}).getCount();
    }
}
