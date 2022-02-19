import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { Departamento } from '../../dto/departamento.dto';
import { Result } from 'pg';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class DepartamentosService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams): Promise<Departamento[]> {
        const { eliminado, id, sort, offset, limit } = queryParams;
        const wp: WhereParam = new WhereParam(
            {eliminado, id},
            null,
            null,
            null,
            { sort, offset, limit}
        );
        let query: string = `SELECT * FROM public.departamento ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number> {
        const { eliminado, id } = queryParams;
        const wp: WhereParam = new WhereParam(
            {eliminado, id},
            null,
            null,
            null,
            null
        );
        let query: string = `SELECT COUNT(*) FROM public.departamento ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
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
