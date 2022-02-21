import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { TipoDomicilio } from '../../dto/tipodomicilio.dto';
import { WhereParam } from '@util/whereparam';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';

@Injectable()
export class TiposdomiciliosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<TipoDomicilio[]>{
        const { eliminado, sort, offset, limit } = queryParams;
        const wp: WhereParam = new WhereParam(
            {eliminado},
            null,
            null,
            null,
            { sort, offset, limit } 
        );
        var query: string = `SELECT * FROM public.tipo_domicilio ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number>{
        const { eliminado } = queryParams;
        const wp: WhereParam = new WhereParam(
            {eliminado},
            null,
            null,
            null,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.tipo_domicilio ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async create(td: TipoDomicilio, idusuario: number){
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.tipo_domicilio(id, descripcion, eliminado)
        VALUES($1, $2, false)`;
        const params =  [td.id, td.descripcion];
        try{
            await cli.query('BEGIN');
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.TIPODOMICILIO, idusuario, td.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
    }

    async edit(oldId: number, td: TipoDomicilio, idusuario: number): Promise<boolean>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.tipo_domicilio SET id = $1, descripcion = $2 WHERE id = $3`;
        const params = [td.id, td.descripcion, oldId];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.TIPODOMICILIO, idusuario, oldId);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.TIPODOMICILIO, idevento, td.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount > 0;
    }

    async findById(id: number): Promise<TipoDomicilio | null>{
        const query: string = `SELECT * FROM public.tipo_domicilio WHERE id = $1`;
        const rows: TipoDomicilio[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length === 0) return null;
        return rows[0];
    }

    async delete(id: number, idusuario: number): Promise<boolean> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.tipo_domicilio SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.TIPODOMICILIO, idusuario, id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
        }finally{
            cli.release();
        }
        return rowCount > 0;
    }

    async getLastId(): Promise<number>{
        const query: string = `SELECT MAX(id) FROM public.tipo_domicilio`;
        return (await this.dbsrv.execute(query)).rows[0].count;
    }

}
