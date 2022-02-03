import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { Cuota } from '@dto/cuota.dto';
import { Util } from '@util/util'; 
import { IWhereParam } from '@util/iwhereparam.interface';

@Injectable()
export class CuotasService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<Cuota[]>{
        const { eliminado, pagado,sort, offset, limit, idservicio, idsuscripcion } = queryParams;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado, idservicio, idsuscripcion, pagado});
        const sol: string = Util.buildSortOffsetLimitStr(sort, offset, limit);
        const query: string = `SELECT * FROM public.vw_cuotas ${wp.whereStr} ${sol}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number>{
        const { eliminado, idservicio, idsuscripcion } = queryParams;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado, idservicio, idsuscripcion});
        const query: string = `SELECT COUNT(*) FROM public.vw_cuotas ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async getCuotasPorSuscripcion(idsuscripcion: number, reqQuery): Promise<Cuota[]> {
        const { eliminado, sort, offset, limit } = reqQuery;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado, idsuscripcion});
        const sol: string = Util.buildSortOffsetLimitStr(sort, offset, limit);
        const query: string = `SELECT * FROM public.vw_cuotas ${wp.whereStr} ${sol}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countCuotasPorSuscripcion(idsuscripcion: number, reqQuery): Promise<number>{
        const { eliminado } = reqQuery;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado, idsuscripcion});
        const query: string = `SELECT COUNT(*) FROM public.vw_cuotas ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async findById(id: number): Promise<Cuota> {
        const wp: IWhereParam = Util.buildAndWhereParam({id});
        const query: string = `SELECT * FROM public.vw_cuotas ${wp.whereStr}`;
        const rows: Cuota[] = (await this.dbsrv.execute(query, wp.whereParams)).rows;
        if(rows.length > 0) return rows[0];
        return null;
    }

    async create(c: Cuota){
        const fechavenc: Date = new Date(c.fechavencimiento);
        const query: string = `INSERT INTO public.cuota(id, fecha_vencimiento, monto, nro_cuota, observacion, idsuscripcion, idservicio, mes, anio, eliminado)
        VALUES(nextval('seq_cuotas'), $1, $2, $3, $4, $5, $6, $7, $8, false)`;
        const params = [c.fechavencimiento, c.monto, c.nrocuota, c.observacion, c.idsuscripcion, c.idservicio, fechavenc.getMonth()+1, fechavenc.getFullYear()];
        await this.dbsrv.execute(query, params);
    }

    async edit(oldid: number, c: Cuota): Promise<boolean>{
        const fechavenc: Date = new Date(c.fechavencimiento);
        const query: string = `UPDATE public.cuota SET id = $1, fecha_vencimiento = $2, monto = $3, nro_cuota = $4, observacion = $5, pagado = $6, fecha_pago = $7, idsuscripcion = $8, idservicio = $9, mes = $10, anio = $11 WHERE id = $12`;
        const params = [c.id, c.fechavencimiento, c.monto, c.nrocuota, c.observacion, c.pagado, c.fechapago, c.idsuscripcion, c.idservicio, fechavenc.getMonth()+1, fechavenc.getFullYear(), oldid];
        return (await this.dbsrv.execute(query, params)).rowCount > 0;
    }

    async delete(id: number): Promise<boolean> {
        const query: string = `UPDATE public.cuota SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }
}
