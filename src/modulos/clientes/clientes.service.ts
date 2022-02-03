import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { Cliente } from '@dto/cliente.dto';
import { Util } from '@util/util';
import { IWhereParam } from '@util/iwhereparam.interface';

@Injectable()
export class ClientesService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams): Promise<Cliente[]> {
        const { eliminado, search, sort, offset, limit } = queryParams;
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado});
        const sof: string = Util.buildSortOffsetLimitStr(sort, offset, limit);
        var query: string = `SELECT * FROM public.vw_clientes ${wp.whereStr}`;
        if(search){
            if(query.indexOf('WHERE') === -1) query += `WHERE`;
            query += ` OR LOWER(razonsocial) LIKE $${wp.lastParamIndex+1}`
            wp.whereParams.push(`%${search.toLowerCase()}%`);
        }
        query += ` ${sof}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number> {
        const { eliminado } = queryParams;
        var query: string = `SELECT COUNT(*) FROM public.vw_clientes`;
        const params: any[] = [];
        if (eliminado) {
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        return (await this.dbsrv.execute(query, params)).rows[0].count;
    }

    async create(c: Cliente) {
        const query: string = `INSERT INTO public.cliente(id, nombres, apellidos, razon_social, telefono1, telefono2, email, idcobrador, ci, dv_ruc, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)`;
        const params: any[] = [c.id, c.nombres, c.apellidos, c.razonsocial, c.telefono1, c.telefono2, c.email, c.idcobrador, c.ci, c.dvruc];
        await this.dbsrv.execute(query, params);
    }

    async getLastId(): Promise<number> {
        const query: string = `SELECT MAX(id) FROM public.cliente`;
        return (await this.dbsrv.execute(query)).rows[0].max;
    }

    async findById(id: number): Promise<Cliente> {
        const query: string = `SELECT * FROM public.vw_clientes WHERE id = $1`;
        const rows: Cliente[] = (await this.dbsrv.execute(query, [id])).rows;
        if (rows.length === 0) return null;
        return rows[0];
    }

    async edit(oldId: number, c: Cliente): Promise<boolean> {
        const query: string = `UPDATE public.cliente SET id = $1, nombres = $2, apellidos = $3, razon_social = $4, telefono1 = $5, telefono2 = $6,
        email = $7, idcobrador = $8, ci = $9, dv_ruc = $10 WHERE id = $11`;
        const params: any[] = [c.id, c.nombres, c.apellidos, c.razonsocial, c.telefono1, c.telefono2, c.email, c.idcobrador, c.ci, c.dvruc, oldId];
        return (await this.dbsrv.execute(query, params)).rowCount > 0;
    }

    async delete(id: number): Promise<boolean> {
        const query: string = `UPDATE public.cliente SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }

}
