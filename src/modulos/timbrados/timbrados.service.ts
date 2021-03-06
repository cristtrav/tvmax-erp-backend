import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service'
import { Timbrado } from '@dto/timbrado.dto';
import { WhereParam } from '@util/whereparam';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';

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
    
    async create(t: Timbrado, idusuario: number){
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO
        public.timbrado(id, cod_establecimiento, cod_punto_emision, nro_inicio, nro_fin, fecha_vencimiento, fecha_inicio_vigencia, nro_timbrado, ultimo_nro_usado, activo, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)`;
        const params = [t.id, t.codestablecimiento, t.codpuntoemision, t.nroinicio, t.nrofin, t.fechavencimiento, t.fechainicio ,t.nrotimbrado, t.ultnrousado, t.activo];
        try{
            await cli.query('BEGIN');
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.TIMBRADOS, idusuario, t.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
    }

    async edit(oldid: number, t: Timbrado, idusuario: number): Promise<boolean>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.timbrado SET id = $1, cod_establecimiento = $2, cod_punto_emision = $3, nro_inicio = $4, nro_fin = $5, fecha_vencimiento = $6, fecha_inicio_vigencia = $7, nro_timbrado = $8, ultimo_nro_usado = $9, activo = $10 WHERE id = $11`;
        const params: any[] = [t.id, t.codestablecimiento, t.codpuntoemision, t.nroinicio, t.nrofin, t.fechavencimiento, t.fechainicio, t.nrotimbrado, t.ultnrousado, t.activo, oldid];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.TIMBRADOS, idusuario, oldid);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.TIMBRADOS, idevento, t.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount > 0;
    }

    async delete(id: number, idusuario: number): Promise<boolean>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.timbrado SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.TIMBRADOS, idusuario, id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount > 0;
    }
}
