import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { Cliente } from '@dto/cliente.dto';
import { WhereParam } from '@util/whereparam';
import { ISearchField } from '@util/isearchfield.interface';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';

@Injectable()
export class ClientesService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams): Promise<Cliente[]> {
        const { eliminado, search, idcobrador, idbarrio, iddistrito, iddepartamento, sort, offset, limit } = queryParams;
        const searchQuery: ISearchField[] = [
            {
                fieldName: 'razonsocial',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'ci',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'id',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'direccion',
                fieldValue: search,
                exactMatch: false
            }
        ];
        const wp: WhereParam = new WhereParam(
            {eliminado, idcobrador},
            { idbarrio, iddistrito, iddepartamento },
            null,
            searchQuery,
            { sort, offset, limit }
        );
        var query: string = `SELECT * FROM public.vw_clientes ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number> {
        const { eliminado, search, idcobrador, idbarrio, iddistrito, iddepartamento } = queryParams;
        const searchQuery: ISearchField[] = [
            {
                fieldName: 'razonsocial',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'ci',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'id',
                fieldValue: search,
                exactMatch: true
            },
            {
                fieldName: 'direccion',
                fieldValue: search,
                exactMatch: false
            }
        ];
        const wp: WhereParam = new WhereParam(
            {eliminado, idcobrador},
            { idbarrio, iddistrito, iddepartamento },
            null,
            searchQuery,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.vw_clientes ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async create(c: Cliente, idusuario: number) {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.cliente(id, nombres, apellidos, razon_social, telefono1, telefono2, email, idcobrador, ci, dv_ruc, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)`;
        const params: any[] = [c.id, c.nombres, c.apellidos, c.razonsocial, c.telefono1, c.telefono2, c.email, c.idcobrador, c.ci, c.dvruc];
        try{
            await cli.query('BEGIN');
            await cli.query(query, params);
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.CLIENTES, idusuario, c.id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
    }

    async getLastId(): Promise<number> {
        const query: string = `SELECT MAX(id) FROM public.cliente`;
        return (await this.dbsrv.execute(query)).rows[0].max;
    }

    async findById(id: number): Promise<Cliente> {
        const query: string = `SELECT * FROM public.vw_clientes WHERE id = $1`;
        const rows: Cliente[] = (await this.dbsrv.execute(query, [id])).rows;
        if (rows.length === 0) return null;
        return rows[0];
    }

    async edit(oldId: number, c: Cliente, idusuario: number): Promise<boolean> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.cliente SET id = $1, nombres = $2, apellidos = $3, razon_social = $4, telefono1 = $5, telefono2 = $6,
        email = $7, idcobrador = $8, ci = $9, dv_ruc = $10 WHERE id = $11`;
        const params: any[] = [c.id, c.nombres, c.apellidos, c.razonsocial, c.telefono1, c.telefono2, c.email, c.idcobrador, c.ci, c.dvruc, oldId];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.CLIENTES, idusuario, oldId);
            rowCount = (await cli.query(query, params)).rowCount;
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.CLIENTES, idevento, c.id);
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
        const query: string = `UPDATE public.cliente SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.CLIENTES, idusuario, id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
        }
        return rowCount > 0;
    }

}
