import { DatabaseService } from '@database/database.service';
import { DetalleFacturaVenta } from '@dto/detalle-factura-venta-dto';
import { Injectable } from '@nestjs/common';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class DetallesVentasService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findByIdVenta(idfacturaventa: number): Promise<DetalleFacturaVenta[]>{
        const eliminado: boolean = false;
        const wp: WhereParam = new WhereParam(
            {idfacturaventa, eliminado},
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT * FROM public.vw_detalles_factura_venta ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countByIdVenta(idfacturaventa: number): Promise<number>{
        const eliminado: boolean = false;
        const wp: WhereParam = new WhereParam(
            {idfacturaventa, eliminado},
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_detalles_factura_venta ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }
}
