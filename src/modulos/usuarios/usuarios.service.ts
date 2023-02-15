import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from "argon2";
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '@database/entity/usuario.entity';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
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
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<UsuarioView> {
        const { eliminado, sort, offset, limit, search, idrol } = queries;
        const alias = 'usuario';
        let query = this.usuarioViewRepo.createQueryBuilder(alias);
        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (idrol) query = query.andWhere(`${alias}.idrol ${Array.isArray(idrol) ? 'IN (:...idrol)' : '= :idrol'}`, {idrol});
        if (limit) query = query.take(limit);
        if (offset) query = query.skip(offset);
        if (sort) {
            const sortColumn: string = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        if (search) query = query.andWhere(
            new Brackets(qb => {
                if (Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.id = :id`, { id: Number(search) });
                qb = qb.orWhere(`LOWER(${alias}.nombres) LIKE :nombressearch`, { nombressearch: `%${search.toLowerCase()}%` });
                qb = qb.orWhere(`LOWER(${alias}.apellidos) LIKE :apellidossearch`, { apellidossearch: `%${search.toLowerCase()}%`});
                qb = qb.orWhere(`${alias}.ci = :cisearch`, { cisearch: search});
                qb = qb.orWhere(`LOWER(${alias}.rol) LIKE :rolsearch`, { rolsearch: `%${search.toLowerCase()}%`});
            })
        );

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
    }

    async findById(id: number): Promise<UsuarioView> {
        return this.usuarioViewRepo.findOneByOrFail({ id });
    }

    async edit(oldId: number, u: Usuario, idusuario: number) {
        const oldUsuario: Usuario = await this.usuarioRepo.findOneByOrFail({ id: oldId });
        if (oldId != u.id && await this.usuarioRepo.findOneBy({ id: u.id, eliminado: false })) throw new HttpException({
            message: `El Usuario con código «${u.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            u.eliminado = false;
            if (u.password) u.password = await argon2.hash(u.password);
            await manager.save(u);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldUsuario, u));
        })
    }

    async delete(id: number, idusuario: number) {
        const usuario: Usuario = await this.usuarioRepo.findOneByOrFail({ id });
        const oldUsuario = { ...usuario }
        usuario.eliminado = true;
        await this.datasource.transaction(async manager => {
            await manager.save(usuario);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldUsuario, usuario));
        })
    }

    public async getLastId(): Promise<number> {
        return (await this.usuarioRepo.createQueryBuilder('usuario')
            .select('MAX(usuario.id)', 'lastid')
            .getRawOne()).lastid;
    }

}
