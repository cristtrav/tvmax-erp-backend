import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { Funcionario } from '@dto/funcionario.dto';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class CobradoresService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<Funcionario[]>{
        const { eliminado, sort, offset, limit } = queryParams;
        const escobrador: boolean = true;
        const wp: WhereParam = new WhereParam(
            { escobrador, eliminado },
            null,
            null,
            null,
            { sort, offset, limit }
        );
        var query: string = `SELECT * FROM public.vw_funcionarios ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number>{
        const { eliminado } = queryParams;
        const escobrador: boolean = true;
        const wp: WhereParam = new WhereParam(
            { escobrador, eliminado },
            null,
            null,
            null,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.vw_funcionarios ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async create(c: Funcionario, idusuario: number){
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.funcionario(id, nombres, ci, telefono, email, dv_ruc, activo, es_cobrador, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, true, false)`;
        const params = [c.id, c.razonsocial, c.ci, c.telefono, c.email, c.dvruc, c.activo];
        try{
            await cli.query('BEGIN');
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.COBRADORES, idusuario, c.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
    }

    async findById(id: number): Promise<Funcionario> {
        const query: string = `SELECT * FROM public.vw_funcionarios WHERE id = $1`;
        const rows: Funcionario[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length > 0) return rows[0];
        return null;
    }

    async edit(oldId: number, c: Funcionario, idusuario: number): Promise<boolean>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.funcionario SET id = $1, nombres = $2, ci = $3, telefono = $4, email = $5, activo = $6, dv_ruc = $7 WHERE id = $8`;
        const params: any[] = [c.id, c.razonsocial, c.ci, c.telefono, c.email, c.activo, c.dvruc, oldId];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.COBRADORES, idusuario, oldId);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.COBRADORES, idevento, c.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount > 0;
    }

    async delete(id: number, idusuario: number): Promise<boolean> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.funcionario SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.COBRADORES, idusuario, id);
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
