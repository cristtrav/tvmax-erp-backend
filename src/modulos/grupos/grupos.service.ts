import { Injectable } from '@nestjs/common';
import { WhereParam } from '@util/whereparam';
import { Grupo } from '../../dto/grupo.dto';
import { DatabaseService } from './../../global/database/database.service';

@Injectable()
export class GruposService {

    constructor(private dbsrv: DatabaseService) {
    }

    async findAll(reqQuery): Promise<Grupo[]> {
        const { eliminado, id, sort, offset, limit } = reqQuery
        const wp: WhereParam = new WhereParam(
            { eliminado, id },
            null,
            null,
            null,
            { sort, offset, limit}
        );
        var query: string = `SELECT * FROM public.grupo ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows
    }

    async count(reqQuery): Promise<number> {
        const { eliminado, id } = reqQuery
        const wp: WhereParam = new WhereParam(
            { eliminado, id },
            null,
            null,
            null,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.grupo ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count
    }

    async findById(id: number): Promise<Grupo> {
        const query = `SELECT * FROM public.grupo WHERE id = $1`
        const params = [id]
        return (await this.dbsrv.execute(query, params)).rows[0];
    }

    async create(g: Grupo) {
        const query = `INSERT INTO public.grupo(id, descripcion) VALUES($1, $2)`
        const params = [g.id, g.descripcion]
        await this.dbsrv.execute(query, params)
    }

    async update(idviejo: string, g: Grupo): Promise<number> {
        const query = `UPDATE public.grupo SET id = $1, descripcion = $2 WHERE id = $3`
        const params = [g.id, g.descripcion, idviejo]
        return (await this.dbsrv.execute(query, params)).rowCount
    }

    async delete(id: string): Promise<number> {
        const query = `UPDATE public.grupo SET eliminado = true WHERE id = $1`
        const params = [id]
        return (await this.dbsrv.execute(query, params)).rowCount
    }

}
