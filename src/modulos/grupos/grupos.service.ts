import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { Injectable } from '@nestjs/common';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { WhereParam } from '@util/whereparam';
import { Grupo } from '../../dto/grupo.dto';
import { DatabaseService } from './../../global/database/database.service';

@Injectable()
export class GruposService {

    constructor(private dbsrv: DatabaseService) {
    }

    async findAll(reqQuery): Promise<Grupo[]> {
        const { eliminado, id, sort, offset, limit } = reqQuery
        const wp: WhereParam = new WhereParam(
            { eliminado, id },
            null,
            null,
            null,
            { sort, offset, limit }
        );
        var query: string = `SELECT * FROM public.grupo ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows
    }

    async count(reqQuery): Promise<number> {
        const { eliminado, id } = reqQuery
        const wp: WhereParam = new WhereParam(
            { eliminado, id },
            null,
            null,
            null,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.grupo ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count
    }

    async findById(id: number): Promise<Grupo> {
        const query = `SELECT * FROM public.grupo WHERE id = $1`
        const params = [id]
        return (await this.dbsrv.execute(query, params)).rows[0];
    }

    async create(g: Grupo, idusuario: number) {
        const cli = await this.dbsrv.getDBClient();
        const query = `INSERT INTO public.grupo(id, descripcion) VALUES($1, $2)`;
        const params = [g.id, g.descripcion]
        try {
            await cli.query('BEGIN');
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.GRUPOS, idusuario, g.id);
            await cli.query('COMMIT');
        } catch (e) {
            await cli.query('ROLLBACK');
            throw e;
        } finally {
            cli.release();
        }
    }

    async update(idviejo: string, g: Grupo, idusuario: number): Promise<number> {
        const cli = await this.dbsrv.getDBClient();
        const query = `UPDATE public.grupo SET id = $1, descripcion = $2 WHERE id = $3`
        const params = [g.id, g.descripcion, idviejo]
        let rowCount = 0;
        try {
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.GRUPOS, idusuario, idviejo);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.GRUPOS, idevento, g.id);
            await cli.query('COMMIT');
        } catch (e) {
            await cli.query('ROLLBACK');
            throw e;
        } finally {
            cli.release();
        }
        return rowCount;
    }

    async delete(id: string, idusuario: number): Promise<number> {
        const cli = await this.dbsrv.getDBClient();
        const query = `UPDATE public.grupo SET eliminado = true WHERE id = $1`;
        const params = [id];
        let rowCount = 0;
        try {
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.GRUPOS, idusuario, id);
            await cli.query('COMMIT');
        } catch (e) {
            await cli.query('ROLLBACK');
            throw e;
        } finally {
            cli.release();
        }
        return rowCount;
    }

    async getLastId(): Promise<number>{
        const query: string = `SELECT MAX(id) FROM public.grupo`;
        return (await this.dbsrv.execute(query)).rows[0].max;
    }

}
