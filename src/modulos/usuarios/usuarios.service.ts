import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import * as argon2 from "argon2";
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { UsuarioDTO } from '@dto/usuario.dto';
import { WhereParam } from '@util/whereparam';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '@database/entity/usuario.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { UsuarioView } from '@database/view/usuario.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';

@Injectable()
export class UsuariosService {

    constructor(
        @InjectRepository(Usuario)
        private usuarioRepo: Repository<Usuario>,
        @InjectRepository(UsuarioView)
        private usuarioViewRepo: Repository<UsuarioView>,
        private datasource: DataSource,
        private dbsrv: DatabaseService
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<UsuarioView> {
        const { eliminado, sort, offset, limit } = queries;
        const alias = 'usuario';
        let query = this.usuarioViewRepo.createQueryBuilder(alias);
        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (limit) query = query.take(limit);
        if (offset) query = query.skip(offset);
        if (sort) {
            const sortColumn: string = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', estadoAnterior: any, estadoNuevo: any): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.fechahora = new Date();
        evento.idtabla = TablasAuditoriaList.USUARIOS.id;
        evento.operacion = operacion;
        evento.estadoanterior = estadoAnterior,
            evento.estadonuevo = estadoNuevo,
            evento.idusuario = idusuario;
        return evento;
    }

    async findAll(queries: { [name: string]: any }): Promise<UsuarioView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    async count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async create(u: Usuario, idusuario: number) {
        const oldUsuario: Usuario | null = await this.usuarioRepo.findOneBy({ id: u.id });
        if (oldUsuario != null && !oldUsuario.eliminado) throw new HttpException({
            message: `El Usuario con ćodigo «${u.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            u.eliminado = false;
            if (u.password) u.password = await argon2.hash(u.password);
            await manager.save(u);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', oldUsuario, u));
        })
        /*const cli = await this.dbsrv.getDBClient();
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
        }*/
    }

    async findById(id: number): Promise<UsuarioView> {
        return this.usuarioViewRepo.findOneByOrFail({ id });
        /*const query: string = `SELECT * FROM public.vw_funcionarios WHERE id = $1`;
        const rows: UsuarioDTO[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length === 0) return null;
        return rows[0];*/
    }

    async edit(oldId: number, u: Usuario, idusuario: number) {
        const oldUsuario: Usuario = await this.usuarioRepo.findOneByOrFail({ id: oldId });
        if (await this.usuarioRepo.findOneBy({ id: u.id, eliminado: false })) throw new HttpException({
            message: `El Usuario con código «${u.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            u.eliminado = false;
            if (u.password) u.password = await argon2.hash(u.password);
            await manager.save(u);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldUsuario, u));
        })
        /*const cli = await this.dbsrv.getDBClient();
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
        return rowCount > 0;*/
    }

    async delete(id: number, idusuario: number) {
        const usuario: Usuario = await this.usuarioRepo.findOneByOrFail({ id });
        const oldUsuario = { ...usuario }
        usuario.eliminado = true;
        await this.datasource.transaction(async manager => {
            await manager.save(usuario);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldUsuario, usuario));
        })
        /*const cli = await this.dbsrv.getDBClient();
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
        return rowCount > 0;*/
    }

}
