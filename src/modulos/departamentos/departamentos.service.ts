import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { Departamento } from '../../dto/departamento.dto';
import { Result } from 'pg';
import { WhereParam } from '@util/whereparam';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';

@Injectable()
export class DepartamentosService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams): Promise<Departamento[]> {
        const { eliminado, id, sort, offset, limit } = queryParams;
        const wp: WhereParam = new WhereParam(
            {eliminado, id},
            null,
            null,
            null,
            { sort, offset, limit}
        );
        let query: string = `SELECT * FROM public.departamento ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number> {
        const { eliminado, id } = queryParams;
        const wp: WhereParam = new WhereParam(
            {eliminado, id},
            null,
            null,
            null,
            null
        );
        let query: string = `SELECT COUNT(*) FROM public.departamento ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async create(d: Departamento, idusuario: number) {
        const cli = await this.dbsrv.getDBClient();
        const query: string = "INSERT INTO public.departamento(id, descripcion, eliminado) VALUES ($1, $2, $3)";
        const params: any[] = [d.id, d.descripcion, false];
        try{
            await cli.query('BEGIN');
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.DEPARTAMENTOS, idusuario, d.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
    }

    async update(oldId: string, d: Departamento, idusuario): Promise<number>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.departamento SET id = $1, descripcion = $2 WHERE id = $3`;
        const params: any[] = [d.id, d.descripcion, oldId];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.DEPARTAMENTOS, idusuario, oldId);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.DEPARTAMENTOS, idevento, d.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount;
    }

    async findById(id: string): Promise<Departamento[]>{
        const query: string = `SELECT * FROM public.departamento WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rows;
    }

    async delete(id: string, idusuario: number): Promise<number>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.departamento SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.DEPARTAMENTOS, idusuario, id);
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
