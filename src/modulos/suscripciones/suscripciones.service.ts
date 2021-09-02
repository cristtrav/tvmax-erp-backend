import { Suscripcion } from '@dto/suscripcion.dto';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';

@Injectable()
export class SuscripcionesService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams){
        const { eliminado, sort, offset, limit } = queryParams;
        var query: string = `SELECT * FROM public.vw_suscripciones`;
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
        var query: string = `SELECT COUNT(*) FROM public.vw_suscripciones`;
        const params: any[] = [];
        if(eliminado){
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        return (await this.dbsrv.execute(query, params)).rows[0].count;
    }

    async getLastId(): Promise<number>{
        const query: string = `SELECT MAX(id) FROM public.suscripcion`;
        return (await this.dbsrv.execute(query)).rows[0].max;
    }

    async create(s: Suscripcion){
        const query: string = `INSERT INTO public.suscripcion(id, monto, fecha_suscripcion, idcliente, iddomicilio, idservicio, estado, fecha_cambio_estado, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, false)`;
        const params: any [] = [s.id, s.monto, s.fechasuscripcion, s.idcliente, s.iddomicilio, s.idservicio, s.estado, s.fechacambioestado];
        await this.dbsrv.execute(query, params);
    }

    async findById(id: number): Promise<Suscripcion>{
        const query: string = `SELECT * FROM public.vw_suscripciones WHERE id = $1`;
        const rows: Suscripcion[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length > 0) return rows[0];
        return null;
    }

    async edit(oldId: number, s: Suscripcion): Promise<boolean>{
        const query: string = `UPDATE public.suscripcion SET id = $1, monto = $2, fecha_suscripcion = $3, idcliente = $4, iddomicilio = $5, idservicio = $6, estado = $7, fecha_cambio_estado = $8 WHERE id = $9`;
        const params: any[] = [s.id, s.monto, s.fechasuscripcion, s.idcliente, s.iddomicilio, s.idservicio, s.estado, s.fechacambioestado, oldId];
        return (await this.dbsrv.execute(query, params)).rowCount > 0;
    }

    async delete(id: number): Promise<boolean>{
        const query: string = `UPDATE public.suscripcion SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }

}
