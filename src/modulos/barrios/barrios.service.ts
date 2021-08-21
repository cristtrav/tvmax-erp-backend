import { Injectable } from '@nestjs/common';
import { Barrio } from '../../dto/barrio.dto';
import { DatabaseService } from '../../global/database/database.service';
import { Result } from 'pg';

@Injectable()
export class BarriosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<Barrio>{
        const { eliminado, sort, offset, limit } = queryParams;
        var query: string = `SELECT * FROM public.vw_barrios`;
        const params: any[] = [];
        if(eliminado){
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        if(sort){
            const srtOrder: string = sort.substring(0, 1) === '-' ? 'DESC' : 'ASC';
            const srtColumn: string = sort.substring(1, sort.length);
            query += ` ORDER BY ${srtColumn} ${srtOrder}`;
        }
        if(offset && limit){
            query += ` OFFSET ${offset} LIMIT ${limit}`;
        }
        return (await this.dbsrv.execute(query, params)).rows;
    }

    async count(queryParam): Promise<number>{
        const { eliminado } = queryParam;
        var query: string = `SELECT COUNT(*) FROM public.barrio`;
        const params: any[] = [];
        if(eliminado){
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        return (await this.dbsrv.execute(query, params)).rows[0].count;
    }

    async create(b: Barrio) {
        const query: string = `INSERT INTO public.barrio(id, descripcion, iddistrito, eliminado)
        VALUES($1, $2, $3, $4)`;
        await this.dbsrv.execute(query, [b.id, b.descripcion, b.iddistrito, false]);
    }

    async findById(id: number): Promise<Barrio[]>{
        const query: string = `SELECT * FROM public.vw_barrios WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rows;
    }

    async edit(oldId: number, b: Barrio): Promise<Result>{
        const query: string = `UPDATE public.barrio SET id = $1, descripcion = $2, iddistrito = $3 WHERE id = $4`;
        return await this.dbsrv.execute(query, [b.id, b.descripcion, b.iddistrito, oldId]);
    }

    async delete(id: number): Promise<Result> {
        const query: string = `UPDATE public.barrio SET eliminado = true WHERE id = $1`;
        return await this.dbsrv.execute(query, [id]);
    }

}
