import { UsuarioDeposito } from '@database/entity/depositos/usuario-deposito.entity';
import { UsuarioDepositoView } from '@database/view/depositos/usuario-deposito.view';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class UsuariosDepositosService {

    constructor(
        @InjectRepository(UsuarioDeposito)
        private usuarioDepositoRepo: Repository<UsuarioDeposito>,
        @InjectRepository(UsuarioDepositoView)
        private usuarioDepositoViewRepo: Repository<UsuarioDepositoView>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<UsuarioDepositoView>{
        const { eliminado, sort, offset, limit, search, rol } = queries;
        const alias = 'usuario';
        let query = this.usuarioDepositoViewRepo.createQueryBuilder(alias);
        if(search) query = query.andWhere(new Brackets(qb => {
            if(Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, {idsearch: Number(search)});
            qb = qb.orWhere(`LOWER(${alias}.razonsocial) LIKE :searchrazonsocial`, {searchrazonsocial: `%${search.toLowerCase()}%`});
        }))
        
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if(rol) query = query.andWhere(`${alias}.rol = :rol`, { rol });
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort){
            const sortOrder: 'DESC' | 'ASC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn != 'id') query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: QueriesType): Promise<UsuarioDepositoView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    async findById(id: number): Promise<UsuarioDepositoView>{
        return this.usuarioDepositoViewRepo.findOneByOrFail({id});
    }

    async create(usuario: UsuarioDeposito, idusuario: number){
        const oldUsuario = await this.usuarioDepositoRepo.findOneBy({id: usuario.id, eliminado: false});
        if(oldUsuario) throw new HttpException({
            message: `$El usuario de depósito con código «${usuario.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST)
        await this.datasource.transaction(async manager =>{
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaUsuarioDeposito(idusuario, 'R', oldUsuario, usuario));
            await manager.save(usuario);
        })
    }

    async edit(oldId: number, usuario: UsuarioDeposito, idusuario){
        if(
            oldId != usuario.id &&
            await this.usuarioDepositoRepo.findOneBy({id: usuario.id, eliminado: false})
        ) throw new HttpException({
            message: `$El usuario de depósito con código «${usuario.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        const oldUsuario = await this.usuarioDepositoRepo.findOneByOrFail({id: oldId});
        await this.datasource.transaction(async manager => {
            if(oldId != usuario.id) await manager.remove(oldUsuario);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaUsuarioDeposito(idusuario, 'M', oldUsuario, usuario));
            await manager.save(usuario);
        })
    }

    async delete(id: number, idusuario: number){
        const usuario = await this.usuarioDepositoRepo.findOneByOrFail({id, eliminado: false});
        const oldUsuario = { ...usuario };
        usuario.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(usuario);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaUsuarioDeposito(idusuario, 'E', oldUsuario, usuario));
        });
    }

    async getLastId(): Promise<number>{
        return (await this.usuarioDepositoRepo
        .createQueryBuilder('usuario')
        .select('MAX(usuario.id)', 'lastid')
        .getRawOne()).lastid;
    }

}

type QueriesType = {[name: string]: any}
