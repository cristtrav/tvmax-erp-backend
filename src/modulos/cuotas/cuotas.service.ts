import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { Cuota } from '@dto/cuota.dto';
import { WhereParam } from '@util/whereparam';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { CobroCuota } from '@dto/cobro-cuota.dto';

@Injectable()
export class CuotasService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams): Promise<Cuota[]> {
        const { eliminado, pagado, sort, offset, limit, idservicio, idsuscripcion } = queryParams;
        const wp: WhereParam = new WhereParam(
            { eliminado, idservicio, idsuscripcion, pagado },
            null,
            null,
            null,
            { sort, offset, limit }
        );
        const query: string = `SELECT * FROM public.vw_cuotas ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number> {
        const { eliminado, idservicio, idsuscripcion, pagado } = queryParams;
        const wp: WhereParam = new WhereParam(
            { eliminado, idservicio, idsuscripcion, pagado },
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_cuotas ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async getCuotasPorSuscripcion(idsuscripcion: number, reqQuery): Promise<Cuota[]> {
        const { eliminado, sort, offset, limit } = reqQuery;
        const wp: WhereParam = new WhereParam(
            { eliminado, idsuscripcion },
            null,
            null,
            null,
            { sort, offset, limit }
        );
        const query: string = `SELECT * FROM public.vw_cuotas ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countCuotasPorSuscripcion(idsuscripcion: number, reqQuery): Promise<number> {
        const { eliminado } = reqQuery;
        const wp: WhereParam = new WhereParam(
            { eliminado, idsuscripcion },
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_cuotas ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async findById(id: number): Promise<Cuota> {
        const wp: WhereParam = new WhereParam(
            { id },
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT * FROM public.vw_cuotas ${wp.whereStr}`;
        const rows: Cuota[] = (await this.dbsrv.execute(query, wp.whereParams)).rows;
        if (rows.length > 0) return rows[0];
        return null;
    }

    async create(c: Cuota, idusuario: number) {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.cuota(id, fecha_vencimiento, monto, nro_cuota, observacion, idsuscripcion, idservicio, eliminado)
        VALUES(nextval('seq_cuotas'), $1, $2, $3, $4, $5, $6, false) RETURNING *`;
        const params = [c.fechavencimiento, c.monto, c.nrocuota, c.observacion, c.idsuscripcion, c.idservicio];
        try {
            await cli.query('BEGIN');
            const idgen = (await cli.query(query, params)).rows[0].id;
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.CUOTAS, idusuario, idgen);
            await cli.query('COMMIT');
        } catch (e) {
            await cli.query('ROLLBACK');
            throw e;
        } finally {
            cli.release();
        }
    }

    async edit(oldid: number, c: Cuota, idusuario: number): Promise<boolean> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.cuota SET id = $1, fecha_vencimiento = $2, monto = $3, nro_cuota = $4, observacion = $5, idsuscripcion = $6, idservicio = $7 WHERE id = $8`;
        const params = [c.id, c.fechavencimiento, c.monto, c.nrocuota, c.observacion, c.idsuscripcion, c.idservicio, oldid];
        let rowCount = 0;
        try {
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.CUOTAS, idusuario, oldid);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.CUOTAS, idevento, c.id);
            await cli.query('COMMIT');
        } catch (e) {
            await cli.query('ROLLBACK');
            throw e;
        } finally {
            cli.release();
        }
        return rowCount > 0;
    }

    async delete(id: number, idusuario: number): Promise<boolean> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.cuota SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try {
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.CUOTAS, idusuario, id);
            await cli.query('COMMIT');
        } catch (e) {
            await cli.query('ROLLBACK');
            throw e;
        } finally {
            cli.release();
        }
        return rowCount > 0;
    }

    async findCobro(idcuota: number): Promise<CobroCuota | null>{
        const wp: WhereParam = new WhereParam(
            {idcuota},
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT * FROM public.vw_cobro_cuotas ${wp.whereStr}`;
        const rows: CobroCuota[] = (await this.dbsrv.execute(query, wp.whereParams)).rows;
        if(rows.length > 0) return rows[0];
        return null;
    }
}
