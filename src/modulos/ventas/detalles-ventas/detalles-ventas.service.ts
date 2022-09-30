import { DatabaseService } from '@database/database.service';
import { DetalleVenta } from '@dto/detalle-venta-dto';
import { Injectable } from '@nestjs/common';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class DetallesVentasService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findByIdVenta(idventa: number): Promise<DetalleVenta[]>{
        const eliminado: boolean = false;
        const wp: WhereParam = new WhereParam(
            {idventa, eliminado},
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT * FROM public.vw_detalles_venta ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countByIdVenta(idventa: number): Promise<number>{
        const eliminado: boolean = false;
        const wp: WhereParam = new WhereParam(
            {idventa, eliminado},
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_detalles_venta ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }
}
