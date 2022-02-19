import { Injectable } from '@nestjs/common';
import { Barrio } from '../../dto/barrio.dto';
import { DatabaseService } from '../../global/database/database.service';
import { Result } from 'pg';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class BarriosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<Barrio[]>{
        const { eliminado, iddistrito, id, sort, offset, limit } = queryParams;
        const wp: WhereParam = new WhereParam(
            {eliminado, iddistrito, id},
            null,
            null,
            null,
            { sort, offset, limit }
        );
        var query: string = `SELECT * FROM public.vw_barrios ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParam): Promise<number>{
        const { eliminado, iddistrito, id } = queryParam;
        const wp: WhereParam = new WhereParam(
            {eliminado, iddistrito, id},
            null,
            null,
            null,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.barrio ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
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
