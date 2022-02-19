import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { Distrito } from '../../dto/distrito.dto';
import { Result } from 'pg';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class DistritosService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParam): Promise<Distrito[]> {
        const { eliminado, iddepartamento, id, sort, limit, offset } = queryParam;
        const wp: WhereParam = new WhereParam(
            { eliminado, iddepartamento, id },
            null,
            null,
            null,
            { sort, offset, limit }
        );
        var query: string = `SELECT * FROM public.vw_distritos ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParam): Promise<number> {
        const { eliminado, iddepartamento, id } = queryParam;
        const wp: WhereParam = new WhereParam(
            { eliminado, iddepartamento, id },
            null,
            null,
            null,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.vw_distritos ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
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
