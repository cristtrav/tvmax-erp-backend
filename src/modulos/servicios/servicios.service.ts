import { Injectable } from '@nestjs/common';
import { Servicio } from '../../dto/servicio.dto';
import { DatabaseService } from '../../global/database/database.service';
import { Result } from 'pg';
import { ISearchField } from '@util/isearchfield.interface';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class ServiciosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(reqQuery): Promise<Servicio[]>{
        const { eliminado, idgrupo, suscribible, search, id, sort, offset, limit } = reqQuery;
        const searchQuery: ISearchField[] = [
            {
                fieldName: 'descripcion',
                fieldValue: search,
                exactMatch: false
            }
        ];
        const wp: WhereParam = new WhereParam(
            { eliminado, suscribible, idgrupo, id },
            null,
            null,
            searchQuery,
            { sort, offset, limit }
        );
        let query: string = `SELECT * FROM public.vw_servicios ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(reqQuery): Promise<number>{
        const { eliminado, search, suscribible, idgrupo, id } = reqQuery;
        const searchQuery: ISearchField[] = [
            {
                fieldName: 'descripcion',
                fieldValue: search,
                exactMatch: false
            }
        ];
        const wp: WhereParam = new WhereParam(
            { eliminado, suscribible, idgrupo, id },
            null,
            null,
            searchQuery,
            null
        );
        let query: string = `SELECT COUNT(*) FROM public.vw_servicios ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count
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
        const wp: WhereParam = new WhereParam(
            {'vw_cuotas.idsuscripcion': idsusc, 'vw_cuotas.pagado': pagado, eliminado},
            null,
            null,
            null,
            { sort, offset, limit }
        );
        var query: string = `SELECT * FROM public.vw_servicios WHERE id IN
        (SELECT vw_cuotas.idservicio AS idcuota FROM public.vw_cuotas ${wp.whereStr}) ${wp.sortOffsetLimitStr}`;        
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countServiciosEnCuotas(idsusc, queryParams): Promise<number>{
        const { eliminado, pagado } = queryParams;
        const wp: WhereParam = new WhereParam(
            {'vw_cuotas.idsuscripcion': idsusc, 'vw_cuotas.pagado': pagado},
            null,
            null,
            null,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.vw_servicios WHERE id IN
        (SELECT vw_cuotas.idservicio AS idservicio FROM public.vw_cuotas ${wp.whereStr})`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

}
