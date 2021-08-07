import { Injectable } from '@nestjs/common';
import { Grupo } from '../../dto/grupo.dto';
import { DatabaseService } from './../../global/database/database.service';

@Injectable()
export class GruposService {

    constructor(private dbsrv: DatabaseService) {
    }

    async findAll(reqQuery): Promise<Grupo[]> {
        const { eliminado, sort, offset, limit } = reqQuery
        var query: string = `SELECT * FROM public.grupo`
        var queryParams: any[] = [];
        if(eliminado){
            query+=` WHERE eliminado=$1`
            queryParams.push(eliminado);
        }
        if(sort){
            const order: string = sort.substring(0, 1) === '-'?'DESC':'ASC'
            const column: string = sort.substring(1, sort.length)
            query+= ` ORDER BY ${column} ${order}`
        }
        if(limit && offset){
            query+=` LIMIT ${limit} OFFSET ${offset}`
        }
        
        return (await this.dbsrv.execute(query, queryParams)).rows
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
