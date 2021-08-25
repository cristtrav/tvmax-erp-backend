import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { TipoDomicilio } from '../../dto/tipodomicilio.dto';
import { Result } from 'pg';

@Injectable()
export class TiposdomiciliosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<TipoDomicilio[]>{
        const { eliminado, sort, offset, limit } = queryParams;
        var query: string = "SELECT * FROM public.tipo_domicilio";
        const params: any[] = [];
        if(eliminado){
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        if(sort){
            const srtOrder: string = sort.substring(0,1) === '-' ? 'DESC' : 'ASC';
            const srtColumn: string = sort.substring(1, sort.length);
            query += ` ORDER BY ${srtColumn} ${srtOrder}`;
        }
        if(offset && limit){
            query += ` OFFSET ${offset} LIMIT ${limit}`;
        }
        return (await this.dbsrv.execute(query, params)).rows;
    }

    async count(queryParams): Promise<number>{
        const { eliminado } = queryParams;
        var query: string = `SELECT COUNT(*) FROM public.tipo_domicilio`;
        if(eliminado){
            query += ` WHERE eliminado = $1`;
        }
        return (await this.dbsrv.execute(query, [eliminado])).rows[0].count;
    }

    async create(td: TipoDomicilio){
        const query: string = `INSERT INTO public.tipo_domicilio(id, descripcion, eliminado)
        VALUES($1, $2, false)`;
        await this.dbsrv.execute(query, [td.id, td.descripcion]);
    }

    async edit(oldId: number, td: TipoDomicilio): Promise<boolean>{
        const query: string = `UPDATE public.tipo_domicilio SET id = $1, descripcion = $2 WHERE id = $3`;
        return (await this.dbsrv.execute(query, [td.id, td.descripcion, oldId])).rowCount > 0;
    }

    async findById(id: number): Promise<TipoDomicilio | null>{
        const query: string = `SELECT * FROM public.tipo_domicilio WHERE id = $1`;
        const rows: TipoDomicilio[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length === 0) return null;
        return rows[0];
    }

    async delete(id: number): Promise<boolean> {
        const query: string = `UPDATE public.tipo_domicilio SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }

}
