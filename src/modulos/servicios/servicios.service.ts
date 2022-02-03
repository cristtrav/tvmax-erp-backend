import { Injectable } from '@nestjs/common';
import { Servicio } from '../../dto/servicio.dto';
import { DatabaseService } from '../../global/database/database.service';
import { Result } from 'pg';
import { IWhereParam } from '@util/iwhereparam.interface';
import { Util } from '@util/util';

@Injectable()
export class ServiciosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(reqQuery): Promise<Servicio[]>{
        const { eliminado, suscribible, sort, offset, limit } = reqQuery;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado, suscribible});
        const sof: string = Util.buildSortOffsetLimitStr(sort, offset, limit);
        var query: string = `SELECT * FROM public.vw_servicios ${wp.whereStr} ${sof}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(reqQuery): Promise<number>{
        const { eliminado } = reqQuery
        var query: string = "SELECT COUNT(*) FROM public.vw_servicios" 
        const queryParams: any[] = [];
        if(eliminado){
            query += ` WHERE eliminado = $1`
            queryParams.push(eliminado)
        }
        return (await this.dbsrv.execute(query, queryParams)).rows[0].count
    }

    async create(s: Servicio){
        const query: string = `INSERT INTO public.servicio 
        (id, descripcion, idgrupo, precio, suscribible)
        VALUES ($1, $2, $3, $4, $5)`
        const params = [s.id, s.descripcion, s.idgrupo, s.precio, s.suscribible]
        await this.dbsrv.execute(query, params)
    }

    async update(oldId: number, s: Servicio): Promise<Result> {
        const query: string = `UPDATE public.servicio SET id = $1, descripcion = $2, idgrupo = $3, precio = $4, suscribible = $5 WHERE id = $6`
        const params = [s.id, s.descripcion, s.idgrupo, s.precio, s.suscribible, oldId]
        return (await this.dbsrv.execute(query, params))
    }

    async findById(id: number): Promise<Servicio[]>{
        const query: string = `SELECT * FROM public.servicio WHERE id = $1`
        const params = [id]
        return (await this.dbsrv.execute(query, params)).rows
    }

    async delete(id: number): Promise<Result> {
        const query: string = `UPDATE public.servicio SET eliminado = true WHERE id = $1`
        const params = [id]
        return (await this.dbsrv.execute(query, params))
    }

    async getServiciosEnCuotas(idsusc: number, queryParams): Promise<Servicio[]>{
        const { eliminado, pagado,sort, offset, limit } = queryParams;
        const wpCuota: IWhereParam = Util.buildAndWhereParam({'vw_cuotas.idsuscripcion': idsusc, 'vw_cuotas.pagado': pagado, eliminado});
        const sofServicios: string = Util.buildSortOffsetLimitStr(sort, offset, limit);
        var query: string = `SELECT * FROM public.vw_servicios WHERE id IN
        (SELECT vw_cuotas.idservicio AS idcuota FROM public.vw_cuotas ${wpCuota.whereStr}) ${sofServicios}`;        
        return (await this.dbsrv.execute(query, wpCuota.whereParams)).rows;
    }

    async countServiciosEnCuotas(idsusc, queryParams): Promise<number>{
        const { eliminado, pagado } = queryParams;
        //const params: any[] = [idsusc];
        const wpCuotas: IWhereParam = Util.buildAndWhereParam({'vw_cuotas.idsuscripcion': idsusc, 'vw_cuotas.pagado': pagado})
        var query: string = `SELECT COUNT(*) FROM public.vw_servicios WHERE id IN
        (SELECT vw_cuotas.idservicio AS idservicio FROM public.vw_cuotas ${wpCuotas.whereStr})`;
        return (await this.dbsrv.execute(query, wpCuotas.whereParams)).rows[0].count;
    }

}
