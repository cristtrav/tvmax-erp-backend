import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { Distrito } from '../../dto/distrito.dto';
import { Result } from 'pg';

@Injectable()
export class DistritosService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParam): Promise<Distrito[]> {
        const { eliminado, sort, limit, offset } = queryParam;
        var query: string = `SELECT * FROM public.vw_distritos`;
        const param: any[] = [];
        if (eliminado) {
            query += ` WHERE eliminado = $1`;
            param.push(eliminado);
        }
        if (sort) {
            const srtOrder = sort.substring(0, 1) === '-' ? 'DESC' : 'ASC';
            const srtColumn = sort.substring(1, sort.lenght);
            query += ` ORDER BY ${srtColumn} ${srtOrder}`;
        }
        if (limit && offset) {
            query += ` OFFSET ${offset} LIMIT ${limit}`;
        }
        return (await this.dbsrv.execute(query, param)).rows;
    }

    async count(queryParam): Promise<number> {
        const { eliminado } = queryParam;
        var query: string = `SELECT COUNT(*) FROM public.vw_distritos`;
        const params: any[] = [];
        if (eliminado) {
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        return (await this.dbsrv.execute(query, params)).rows[0].count;
    }

    async create(d: Distrito){
        const query: string = `INSERT INTO public.distrito(id, descripcion, iddepartamento, eliminado)
        VALUES($1, $2, $3, $4)`;
        const params: any = [d.id, d.descripcion, d.iddepartamento, false];
        await this.dbsrv.execute(query, params);
    }

    async findById(id: string): Promise<Distrito[]>{
        const query: string = `SELECT * FROM public.vw_distritos WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rows;
    }

    async edit(oldId: string, d: Distrito): Promise<Result>{
        const query: string = `UPDATE public.distrito SET id = $1, descripcion = $2, iddepartamento = $3 WHERE id = $4`;
        return await this.dbsrv.execute(query, [d.id, d.descripcion, d.iddepartamento, oldId]);
    }

    async delete(id: string): Promise<Result>{
        const query: string = `UPDATE public.distrito SET eliminado = true WHERE id = $1`;
        return await this.dbsrv.execute(query, [id]);
    }

}
