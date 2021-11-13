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
        const { eliminado, sort, offset, limit } = reqQuery;
        var query: string = "SELECT * FROM public.vw_servicios"
        const queryParams: any[] = []
        if(eliminado){
            query += " WHERE eliminado = $1"
            queryParams.push(eliminado)
        }
        if(sort){
            const srtOrder = sort.substring(0, 1) === '-' ? 'DESC' : 'ASC'
            const srtColumn = sort.substring(1, sort.length)
            query += ` ORDER BY ${srtColumn} ${srtOrder}`
        }
        if(offset && limit){
            query += ` OFFSET ${offset} LIMIT ${limit}`
        }
        return (await this.dbsrv.execute(query, queryParams)).rows
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
        const { eliminado, sort, offset, limit } = queryParams;
        const params: any[] = [idsusc];
        var query: string = `SELECT * FROM public.vw_servicios WHERE id IN
        (SELECT cuota.idservicio AS idcuota FROM public.cuota WHERE cuota.idsuscripcion = $1 ${eliminado?' AND eliminado = $2':''})`;        
        if(eliminado){
            params.push(eliminado);
        }
        if(sort){
            const srtOrder = sort.substring(0,1) === '-' ? 'DESC' : 'ASC';
            const srtColumn = sort.substring(1, sort.length);
            query += ` ORDER BY ${srtColumn} ${srtOrder}`;
        }
        if(offset){
            query += ` OFFSET ${offset}`;
        }
        if(limit){
            query += ` LIMIT ${limit}`;
        }
        return (await this.dbsrv.execute(query, params)).rows;
    }

    async countServiciosEnCuotas(idsusc, queryParams): Promise<number>{
        const { eliminado } = queryParams;
        const params: any[] = [idsusc];
        var query: string = `SELECT COUNT(*) FROM public.vw_servicios WHERE id IN
        (SELECT cuota.idservicio AS idcuota FROM public.cuota WHERE cuota.idsuscripcion = $1 ${eliminado?' AND eliminado = $2':''})`;
        if(eliminado){
            params.push(eliminado);
        }
        return (await this.dbsrv.execute(query, params)).rows[0].count;
    }

}
