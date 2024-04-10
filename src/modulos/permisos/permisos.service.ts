import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Modulo } from '@database/entity/modulo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Funcionalidad } from '@database/entity/funcionalidad.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';

@Injectable()
export class PermisosService {
  constructor(
        @InjectRepository(Modulo)
        private moduloRepo: Repository<Modulo>,
        @InjectRepository(Usuario)
        private usuarioRepo: Repository<Usuario>,
        @InjectRepository(Funcionalidad)
        private funcionalidadRepo: Repository<Funcionalidad>,
        private datasource: DataSource
    ) { }

    private getSelectQueryModulos(queries: { [name: string]: any }): SelectQueryBuilder<Modulo> {
        const { eliminado, sort, offset, limit } = queries;
        const alias = 'modulo';
        let query = this.moduloRepo.createQueryBuilder(alias);
        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (limit) query = query.take(limit);
        if (offset) query = query.skip(offset);
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        query = query.leftJoinAndSelect(`${alias}.funcionalidades`, 'funcionalidades', 'funcionalidades.eliminado = :eliminado', { eliminado: 'false' });
        return query;
    }

    findAllModulos(queries: { [name: string]: any }): Promise<Modulo[]> {
        return this.getSelectQueryModulos(queries).getMany();
    }

    countModulos(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQueryModulos(queries).getCount();
    }

    async findPermisosByIdUsuario(idusuario: number, queries: { [name: string]: any }): Promise<Funcionalidad[]> {
        const { eliminado, sort, offset, limit } = queries;
        const alias = 'funcionalidad';
        let query = this.funcionalidadRepo.createQueryBuilder(alias);
        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (offset) query = query.skip(offset);
        if (limit) query = query.take(limit);
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        query = query.leftJoinAndSelect(`${alias}.usuarios`, 'usuarios');
        query = query.andWhere(`usuarios.id = :idusuario`, { idusuario });
        return query.getMany();
    }

    async editPermisosUsuario(idusuario: number, idusuarioModificar: number, idfuncionalidades: number[]): Promise<any> {
        const usuario = await this.usuarioRepo.createQueryBuilder('usuario')
            .where(`usuario.id = :idusuario`, { idusuario: idusuarioModificar })
            .leftJoinAndSelect(`usuario.permisos`, 'permisos')
            .leftJoinAndSelect(`permisos.modulo`, 'modulo')
            .getOneOrFail();
        const oldPermisos: IDatosEventoPermiso = this.getPermisosUsuarioEvento(usuario);

        if(idfuncionalidades.length > 0) usuario.permisos = await this.funcionalidadRepo
            .createQueryBuilder('funcionalidad')
            .where(`funcionalidad.id IN (:...idfuncionalidades)`, { idfuncionalidades })
            .leftJoinAndSelect(`funcionalidad.modulo`, 'modulo')
            .getMany();
        else usuario.permisos = [];
        const newPermisos = this.getPermisosUsuarioEvento(usuario);

        await this.datasource.transaction(async manager => {
            await manager.save(usuario);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaUsuario(idusuario, 'M', oldPermisos, newPermisos))
        });
    }

    private getPermisosUsuarioEvento(usuario: Usuario): IDatosEventoPermiso {
        return {
            idusuario: usuario.id,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            permisos: usuario.permisos.map(permiso => `${permiso.id}-${permiso.nombre}(${permiso.modulo.id}-${permiso.modulo.descripcion})`).join(', ')
        }
    }
}

interface IDatosEventoPermiso {
    idusuario: number;
    nombres: string;
    apellidos: string;
    permisos: string;
}
