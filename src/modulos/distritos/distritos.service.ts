import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { Distrito } from '../../dto/distrito.dto';
import { Result } from 'pg';
import { WhereParam } from '@util/whereparam';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';

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

    async create(d: Distrito, idusuario: number){
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.distrito(id, descripcion, iddepartamento, eliminado)
        VALUES($1, $2, $3, $4)`;
        const params: any = [d.id, d.descripcion, d.iddepartamento, false];
        try{
            await cli.query('BEGIN');
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.DISTRITOS, idusuario, d.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
    }

    async findById(id: string): Promise<Distrito[]>{
        const query: string = `SELECT * FROM public.vw_distritos WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rows;
    }

    async edit(oldId: string, d: Distrito, idusuario: number): Promise<number>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.distrito SET id = $1, descripcion = $2, iddepartamento = $3 WHERE id = $4`;
        const params = [d.id, d.descripcion, d.iddepartamento, oldId];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.DISTRITOS, idusuario, oldId);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.DISTRITOS, idevento, d.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount;
    }

    async delete(id: string, idusuario: number): Promise<number>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.distrito SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.DISTRITOS, idusuario, id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount;
    }

}
