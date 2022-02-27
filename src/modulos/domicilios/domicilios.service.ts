import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { Domicilio } from '@dto/domicilio.dto';
import { WhereParam } from '@util/whereparam';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';

@Injectable()
export class DomiciliosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParams): Promise<Domicilio[]>{
        const { eliminado, idcliente, sort, offset, limit } = queryParams;
        const wp: WhereParam = new WhereParam(
            {eliminado, idcliente},
            null,
            null,
            null,
            { sort, offset, limit }
        );        
        const query: string = `SELECT * FROM public.vw_domicilios ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number>{
        const { eliminado, idcliente } = queryParams;
        const wp: WhereParam = new WhereParam(
            {eliminado, idcliente},
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_domicilios ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async getLastId(): Promise<number>{
        const query: string = `SELECT MAX(id) FROM public.domicilio`;
        return (await this.dbsrv.execute(query)).rows[0].max;
    }

    async create(d: Domicilio, idusuario: number){
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.domicilio(id, direccion, nro_medidor, idbarrio, observacion, idtipo_domicilio, idcliente, principal, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, false)`;
        const params: any[] = [d.id, d.direccion, d.nromedidor, d.idbarrio, d.observacion, d.idtipodomicilio, d.idcliente, d.principal];
        try{
            await cli.query('BEGIN');
            if(d.principal === true){
                const queryPrincipal: string = `UPDATE public.domicilio SET principal = false WHERE idcliente = $1`;
                await cli.query(queryPrincipal, [d.idcliente]);
            }
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.DOMICILIOS, idusuario, d.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
    }

    async edit(oldId: number, d: Domicilio, idusuario: number): Promise<boolean>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.domicilio SET id = $1, direccion = $2, nro_medidor = $3, idbarrio = $4, observacion = $5, idtipo_domicilio = $6, idcliente = $7, principal = $8 WHERE id = $9`;
        const params: any[] = [d.id, d.direccion, d.nromedidor, d.idbarrio, d.observacion, d.idtipodomicilio, d.idcliente, d.principal, oldId];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            if(d.principal === true){
                const queryPrincipal: string = `UPDATE public.domicilio SET principal = false WHERE idcliente = $1`;
                await cli.query(queryPrincipal, [d.idcliente]);
            }
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.DOMICILIOS, idusuario, oldId);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.DOMICILIOS, idevento, d.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount > 0;
    }

    async findById(id: number): Promise<Domicilio | null> {
        const query: string = `SELECT * FROM public.vw_domicilios WHERE id = $1`;
        const rows: Domicilio[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length === 0) return null;
        return rows[0];
    }

    async delete(id: number, idusuario: number): Promise<boolean> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.domicilio SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.DOMICILIOS, idusuario, id);
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
