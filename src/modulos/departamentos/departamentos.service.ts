import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { Departamento } from '../../dto/departamento.dto';
import { Result } from 'pg';

@Injectable()
export class DepartamentosService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams): Promise<Departamento[]> {
        const { eliminado, sort, offset, limit } = queryParams;
        let query: string = `SELECT * FROM public.departamento`;
        const params: any[] = [];
        if (eliminado) {
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        if (sort) {
            const srtOrder = sort.substring(0, 1) === '-' ? 'DESC' : 'ASC';
            const srtColumn = sort.substring(1, sort.lenght);
            query += ` ORDER BY ${srtColumn} ${srtOrder}`;
        }
        if(offset && limit){
            query += ` OFFSET ${offset} LIMIT ${limit}`;
        }
        return (await this.dbsrv.execute(query, params)).rows;
    }

    async count(queryParams): Promise<number> {
        const { eliminado } = queryParams;
        let query: string = `SELECT COUNT(*) FROM public.departamento`;
        const params: any[] = [];
        return (await this.dbsrv.execute(query, params)).rows[0].count;
    }

    async create(d: Departamento) {
        const query: string = "INSERT INTO public.departamento(id, descripcion, eliminado) VALUES ($1, $2, $3)";
        const params: any[] = [d.id, d.descripcion, false];
        await this.dbsrv.execute(query, params);
    }

    async update(oldId: string, d: Departamento): Promise<Result>{
        const query: string = `UPDATE public.departamento SET id = $1, descripcion = $2 WHERE id = $3`;
        const params: any[] = [d.id, d.descripcion, oldId];
        return await this.dbsrv.execute(query, params);
    }

    async findById(id: string): Promise<Departamento[]>{
        const query: string = `SELECT * FROM public.departamento WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rows;
    }

    async delete(id: string): Promise<Result>{
        const query: string = `UPDATE public.departamento SET eliminado = true WHERE id = $1`;
        return await this.dbsrv.execute(query, [id]);
    }

}
