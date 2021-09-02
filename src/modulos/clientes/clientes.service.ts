import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Cliente } from '@dto/cliente.dto';

@Injectable()
export class ClientesService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams): Promise<Cliente[]> {
        const { eliminado, sort, offset, limit } = queryParams;
        var query: string = `SELECT * FROM public.vw_clientes`;
        const params: any[] = [];
        if (eliminado) {
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        if (sort) {
            const srtOrder: string = sort.substring(0, 1) === '-' ? 'DESC' : 'ASC';
            const srtColumn: string = sort.substring(1, sort.length);
            query += ` ORDER BY ${srtColumn} ${srtOrder}`;
        }
        if (offset) {
            query += ` OFFSET ${offset}`;
        }
        if (limit) {
            query += ` LIMIT ${limit}`;
        }
        return (await this.dbsrv.execute(query, params)).rows;
    }

    async count(queryParams): Promise<number>{
        const { eliminado } = queryParams;
        var query: string = `SELECT COUNT(*) FROM public.vw_clientes`;
        const params: any[] = [];
        if(eliminado){
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        return (await this.dbsrv.execute(query, params)).rows[0].count;
    }

}
