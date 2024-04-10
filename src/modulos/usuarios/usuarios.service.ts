import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from "argon2";
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '@database/entity/usuario.entity';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { UsuarioView } from '@database/view/usuario.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { Rol } from '@database/entity/rol.entity';
import { RolUsuario } from '@database/entity/rol-usuario.entity';
import { RolView } from '@database/view/rol.view';

@Injectable()
export class UsuariosService {

    constructor(
        @InjectRepository(Usuario)
        private usuarioRepo: Repository<Usuario>,
        @InjectRepository(UsuarioView)
        private usuarioViewRepo: Repository<UsuarioView>,
        @InjectRepository(Rol)
        private rolRepo: Repository<Rol>,
        @InjectRepository(RolView)
        private rolViewRepo: Repository<RolView>,
        @InjectRepository(RolUsuario)
        private rolUsuarioRepo: Repository<RolUsuario>,
        private datasource: DataSource,
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<UsuarioView> {
        const { eliminado, sort, offset, limit, search, idrol } = queries;
        const alias = 'usuario';
        let query = this.usuarioViewRepo.createQueryBuilder(alias);
        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if(idrol != null)
            if(Array.isArray(idrol)) query = query.andWhere(`${alias}.idroles && :idrol`, { idrol });
            else query = query.andWhere(`:idrol = ANY(${alias}.idroles)`, { idrol });
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
                qb = qb.orWhere(`LOWER(${alias}.apellidos) LIKE :apellidossearch`, { apellidossearch: `%${search.toLowerCase()}%` });
                qb = qb.orWhere(`${alias}.ci = :cisearch`, { cisearch: search });
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

    async create(u: Usuario, idroles: number[] | null, idusuario: number) {
        const oldUsuario = await this.usuarioRepo.findOne({
            where: { id: u.id },
            relations: { roles: true }
        });
        if (oldUsuario != null && !oldUsuario.eliminado) throw new HttpException({
            message: `El Usuario con ćodigo «${u.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            if(oldUsuario){
                for(let rol of oldUsuario.roles){
                    const rolusuario = new RolUsuario();
                    rolusuario.idrol = rol.id;
                    rolusuario.idusuario = u.id;
                    await manager.remove(rolusuario);
                }
            }
            
            u.eliminado = false;
            if (u.password) u.password = await argon2.hash(u.password);
            
            await manager.save(u);

            if(idroles){
                u.roles = await this.rolRepo.createQueryBuilder('rol').whereInIds(idroles).getMany();
                for(let idrol of idroles){
                    const rolusuario = new RolUsuario();
                    rolusuario.idrol = idrol;
                    rolusuario.idusuario = u.id;
                    await manager.save(rolusuario);
                }
            }
            await manager.save(this.getEventoAuditoria(idusuario, 'R', oldUsuario, u));
        });
    }

    async findById(id: number): Promise<UsuarioView> {
        return this.usuarioViewRepo.findOneByOrFail({ id });
    }

    async findRolesByUsuario(idusuario: number): Promise<RolView[]>{
        const usuario = await this.usuarioRepo.findOneOrFail({
            where: {id: idusuario, eliminado: false},
            relations: {roles: true}
        });        
        const idroles = usuario.roles.map(r => r.id);
        if(usuario.roles.length > 0)
            return await this.rolViewRepo
                .createQueryBuilder('rol')
                .where(`rol.id IN (:...idroles)`, {idroles})
                .getMany();
        return [];
    }

    async edit(oldId: number, u: Usuario, idroles: number[] | null, idusuario: number) {
        const oldUsuario = await this.usuarioRepo.findOneOrFail({
            where: { id: oldId },
            relations: { roles: true }
        });
        const oldRolesUsuarios = await this.rolUsuarioRepo.findBy({idusuario: oldId});
        if (oldId != u.id && await this.usuarioRepo.findOneBy({ id: u.id, eliminado: false })) throw new HttpException({
            message: `El Usuario con código «${u.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            u.eliminado = false;
            
            if (u.password) u.password = await argon2.hash(u.password);
            else delete u.password;

            await manager.save(u);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldUsuario, u));
            if(idroles){
                for(let oldRolUsuario of oldRolesUsuarios) await manager.remove(oldRolUsuario);
                for(let idrol of idroles){
                    const rolUsuario = new RolUsuario();
                    rolUsuario.idrol = idrol;
                    rolUsuario.idusuario = u.id;
                    await manager.save(rolUsuario);
                }
            }
            if(oldId != u.id) await manager.remove(oldUsuario);
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

    public async changePassword(idusuario: number, oldPass: string, newPass: string) {
        const usuario = await this.usuarioRepo.findOneByOrFail({ id: idusuario });
        if (await argon2.verify(usuario.password, oldPass)) {
            usuario.password = await argon2.hash(newPass);
            await this.usuarioRepo.save(usuario);
        } else {
            throw new HttpException({
                message: 'La contraseña antigua es incorrecta'
            }, HttpStatus.BAD_REQUEST);
        }
    }

    public async editRolesByUsuario(idusuarioEditar: number, idroles: number[], idusuario: number){
        await this.usuarioRepo.findOneByOrFail({id: idusuarioEditar});
        const oldRolesUsuarios = await this.rolUsuarioRepo.findBy({idusuario: idusuarioEditar});
        await this.datasource.transaction(async manager => {
            for(let rolUsuario of oldRolesUsuarios){
                await manager.remove(rolUsuario);
            }
            for(let idrol of idroles){
                const rolUsuario = new RolUsuario();
                rolUsuario.idrol = idrol;
                rolUsuario.idusuario = idusuarioEditar;
                await manager.save(rolUsuario);
            }
        });
    }
}
