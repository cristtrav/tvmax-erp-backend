import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service'
import { Timbrado } from '@dto/timbrado.dto';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class TimbradosService {
    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(params): Promise<Timbrado[]>{
        const { eliminado, activo, sort, offset, limit } = params;
        const wp: WhereParam = new WhereParam(
            {eliminado, activo},
            null,
            null,
            null,
            { sort, offset, limit }
        );
        const query: string = `SELECT * FROM public.vw_timbrados ${wp.whereStr} ${wp.sortOffsetLimitStr}`;        
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async findById(id: number): Promise<Timbrado>{
        const query: string = `SELECT * FROM public.vw_timbrados WHERE id = $1`;
        const rows: Timbrado[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length > 0) return rows[0];
        return null;
    }

    async count(params): Promise<number>{
        const { eliminado, activo } = params;
        const wp: WhereParam = new WhereParam(
            {eliminado, activo},
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.timbrado ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }
    
    async create(t: Timbrado){
        const query: string = `INSERT INTO
        public.timbrado(id, cod_establecimiento, cod_punto_emision, nro_inicio, nro_fin, fecha_vencimiento, timbrado, ultimo_nro_usado, activo, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, false)`;
        const params = [t.id, t.codestablecimiento, t.codpuntoemision, t.nroinicio, t.nrofin, t.fechavencimiento, t.timbrado, t.ultnrousado, t.activo];
        await this.dbsrv.execute(query, params);
    }

    async edit(oldid: number, t: Timbrado): Promise<boolean>{
        const query: string = `UPDATE public.timbrado SET id = $1, cod_establecimiento = $2, cod_punto_emision = $3, nro_inicio = $4, nro_fin = $5, fecha_vencimiento = $6, timbrado = $7, ultimo_nro_usado = $8, activo = $9 WHERE id = $10`;
        const params: any[] = [t.id, t.codestablecimiento, t.codpuntoemision, t.nroinicio, t.nrofin, t.fechavencimiento, t.timbrado, t.ultnrousado, t.activo, oldid];
        return (await this.dbsrv.execute(query, params)).rowCount > 0;
    }

    async delete(id: number): Promise<boolean>{
        const query: string = `UPDATE public.timbrado SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }
}
