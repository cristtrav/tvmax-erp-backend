import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { Cobrador } from '../../dto/cobrador.dto';

@Injectable()
export class CobradoresService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<Cobrador[]>{
        const { eliminado, sort, offset, limit } = queryParams;
        var query: string = `SELECT id, razon_social AS razonsocial, ci, telefono, email, activo, eliminado, dv_ruc AS dvruc FROM public.cobrador`;
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

    async count(queryParams): Promise<number>{
        const { eliminado } = queryParams;
        var query: string = `SELECT COUNT(*) FROM public.cobrador`;
        const params: any[] = [];
        if(eliminado){
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        return (await this.dbsrv.execute(query, params)).rows[0].count;
    }

    async create(c: Cobrador){
        const query: string = `INSERT INTO public.cobrador(id, razon_social, ci, telefono, email, dv_ruc, activo, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, false)`;
        await this.dbsrv.execute(query, [c.id, c.razonsocial, c.ci, c.telefono, c.email, c.dvruc, c.activo]);
    }

    async findById(id: number): Promise<Cobrador> {
        const query: string = `SELECT id, razon_social AS razonsocial, ci, telefono, email, activo, eliminado, dv_ruc AS dvruc FROM public.cobrador WHERE id = $1`;
        const rows: Cobrador[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length > 0) return rows[0];
        return null;
    }

    async edit(oldId: number, c: Cobrador): Promise<boolean>{
        const query: string = `UPDATE public.cobrador SET id = $1, razon_social = $2, ci = $3, telefono = $4, email = $5, activo = $6, dv_ruc = $7 WHERE id = $8`;
        const params: any[] = [c.id, c.razonsocial, c.ci, c.telefono, c.email, c.activo, c.dvruc, oldId];
        return (await this.dbsrv.execute(query, params)).rowCount > 0;
    }

    async delete(id: number): Promise<boolean> {
        const query: string = `UPDATE public.cobrador SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }

}
