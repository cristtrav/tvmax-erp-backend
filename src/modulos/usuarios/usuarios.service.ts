import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import * as argon2 from "argon2";
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { Funcionario } from '@dto/funcionario.dto';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class UsuariosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParam): Promise<Funcionario[]>{
        const { eliminado, sort, offset, limit } = queryParam;
        const esusuario: boolean = true;
        const wp: WhereParam = new WhereParam(
            { esusuario, eliminado },
            null,
            null,
            null,
            { sort, offset, limit }
        ); 
        var query: string = `SELECT * FROM public.vw_funcionarios ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParam): Promise<number>{
        const { eliminado } = queryParam;
        const esusuario: boolean = true;
        const wp: WhereParam = new WhereParam(
            { esusuario, eliminado },
            null,
            null,
            null,
            null
        ); 
        var query: string = `SELECT COUNT(*) FROM public.vw_funcionarios ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async create(u: Funcionario, idusuario: number){
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.funcionario(id, nombres, apellidos, ci, email, telefono, activo)
        VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        const params: any[] = [u.id, u.nombres, u.apellidos, u.ci, u.email, u.telefono, u.activo]
        try{
            cli.query('BEGIN');
            await cli.query(query, params);
            if(u.password){
                const pwdHash = await argon2.hash(u.password);
                await cli.query('UPDATE public.funcionario SET password = $1 WHERE id = $2', [pwdHash, u.id]);
            }
            await AuditQueryHelper.auditPostInsert(cli, TablasAuditoriaList.USUARIOS, idusuario, u.id);
            cli.query('COMMIT');
        }catch(e){
            cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
    }

    async findById(id: number): Promise<Funcionario | null>{
        const query: string = `SELECT * FROM public.vw_funcionarios WHERE id = $1`;
        const rows: Funcionario[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length === 0) return null;
        return rows[0];
    }

    async edit(oldId: number, u: Funcionario, idusuario: number): Promise<boolean>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.funcionario SET id = $1, nombres = $2, apellidos = $3, ci = $4, email = $5, telefono = $6, activo = $7 WHERE id = $8`;
        const params: any[] = [u.id, u.nombres, u.apellidos, u.ci, u.email, u.telefono, u.activo, oldId];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.USUARIOS, idusuario, oldId);
            rowCount = (await cli.query(query, params)).rowCount;
            if(u.password){
                const pwdHash = await argon2.hash(u.password);
                await cli.query('UPDATE public.funcionario SET password = $1 WHERE id = $2', [pwdHash, u.id]);
            }
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.USUARIOS, idevento, u.id);
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
        const query: string = `UPDATE public.funcionario SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            await AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.USUARIOS, idusuario, id);
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
