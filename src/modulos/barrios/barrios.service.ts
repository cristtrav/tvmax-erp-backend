import { Injectable } from '@nestjs/common';
import { Barrio } from '../../dto/barrio.dto';
import { DatabaseService } from '../../global/database/database.service';
import { Result } from 'pg';
import { WhereParam } from '@util/whereparam';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { ISearchField } from '@util/isearchfield.interface';

@Injectable()
export class BarriosService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams): Promise<Barrio[]> {
        const { eliminado, iddistrito, iddepartamento, id, search, sort, offset, limit } = queryParams;
        const searchQuery: ISearchField[] = [
            {
                fieldName: 'descripcion',
                exactMatch: false,
                fieldValue: search
            }
        ];
        const wp: WhereParam = new WhereParam(
            { eliminado, id },
            { iddistrito, iddepartamento },
            null,
            searchQuery,
            { sort, offset, limit }
        );
        var query: string = `SELECT * FROM public.vw_barrios ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParam): Promise<number> {
        const { eliminado, iddistrito, iddepartamento, id, search } = queryParam;
        const searchQuery: ISearchField[] = [
            {
                fieldName: 'descripcion',
                exactMatch: false,
                fieldValue: search
            }
        ];
        const wp: WhereParam = new WhereParam(
            { eliminado, id },
            { iddistrito, iddepartamento },
            null,
            searchQuery,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.vw_barrios ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async create(b: Barrio, idusuario: number) {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.barrio(id, descripcion, iddistrito, eliminado)
        VALUES($1, $2, $3, $4)`;
        const params = [b.id, b.descripcion, b.iddistrito, false];
        try {
            await cli.query('BEGIN');
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.BARRIOS, idusuario, b.id);
            await cli.query('COMMIT');
        } catch (e) {
            await cli.query('ROLLBACK');
            throw e;
        } finally {
            cli.release();
        }
    }

    async findById(id: number): Promise<Barrio[]> {
        const query: string = `SELECT * FROM public.vw_barrios WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rows;
    }

    async edit(oldId: number, b: Barrio, idusuario: number): Promise<number> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.barrio SET id = $1, descripcion = $2, iddistrito = $3 WHERE id = $4`;
        const params = [b.id, b.descripcion, b.iddistrito, oldId];
        let rowCount = 0;
        try {
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.BARRIOS, idusuario, oldId);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.BARRIOS, idevento, b.id);
            await cli.query('COMMIT');
        } catch (e) {
            await cli.query('ROLLBACK');
            throw e;
        } finally {
            cli.release();
        }
        return rowCount;
    }

    async delete(id: number, idusuario: number): Promise<number> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.barrio SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try {
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id]));
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.BARRIOS, idusuario, id);
            await cli.query('COMMIT');
        } catch (e) {
            await cli.query('ROLLBACK');
            throw e;
        } finally {
            cli.release();
        }
        return rowCount;
    }

    async getLastId(): Promise<number> {
        const query: string = `SELECT MAX(id) FROM public.barrio`;
        return (await this.dbsrv.execute(query)).rows[0].max;
    }

}
