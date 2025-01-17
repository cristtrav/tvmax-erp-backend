import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { Rol } from '@database/entity/rol.entity';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { RolView } from '@database/view/rol.view';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class RolesService {

    constructor(
        @InjectRepository(Rol)
        private rolRepo: Repository<Rol>,
        @InjectRepository(RolView)
        private rolViewRepo: Repository<RolView>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<RolView>{
        const { eliminado, sort, offset, limit, search } = queries;
        const alias = 'rol';
        let query: SelectQueryBuilder<RolView> = this.rolViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort){
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        if(search){
            query = query.andWhere(
                new Brackets(qb => {
                    qb.orWhere(`LOWER(${alias}.descripcion) LIKE :descsearch`, {descsearch: `%${search.toLowerCase()}%`})
                    if(Number.isInteger(Number(search))) qb.orWhere(`${alias}.id = :idsearch`, {idsearch: Number(search)});
                })
            );
        }
        return query;
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', estadoanterior: any, estadonuevo: any): EventoAuditoria{
        const evento: EventoAuditoria = new EventoAuditoria();
        evento.fechahora = new Date();
        evento.idusuario = idusuario,
        evento.estadoanterior = estadoanterior;
        evento.estadonuevo = estadonuevo;
        evento.idtabla = TablasAuditoriaList.COBRADORES.id;
        evento.operacion = operacion;
        return evento;
    }

    public findAll(queries: {[name: string]: any}): Promise<RolView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    public count(queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    public async create(rol: Rol, idusuario: number){
        if(await this.rolRepo.findOneBy({id: rol.id, eliminado: false})) throw new HttpException(
            {
                message: `El rol con código «${rol.id}» ya existe.`
            },
            HttpStatus.BAD_REQUEST
        );
        await this.datasource.transaction(async manager => {
            rol.eliminado = false;
            await manager.save(rol);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', null, rol));
        })
    }

    public findById(id: number): Promise<Rol>{
        return this.rolRepo.findOneByOrFail({id: id});
    }

    public async edit(oldId: number, rol: Rol, idusuario: number){
        const oldRol: Rol = await this.rolRepo.findOneByOrFail({id: oldId});

        if(oldRol.soloLectura) throw new HttpException({
            message: `El Rol «${oldRol.descripcion}» no se puede editar.`
        }, HttpStatus.FORBIDDEN);

        if(oldId != rol.id && await this.rolRepo.findOneBy({id: rol.id, eliminado: false})) throw new HttpException({
            message: `El Rol con código «${rol.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            rol.eliminado = false;
            await manager.save(rol);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldRol, rol));
            if(oldRol.id != rol.id) await manager.remove(oldRol);
        })
    }

    public async delete(id: number, idusuario: number){
        const rol: Rol = await this.rolRepo.findOneByOrFail({id});

        if(rol.soloLectura) throw new HttpException({
            message: `El Rol «${rol.descripcion}» no se puede eliminar.`
        }, HttpStatus.FORBIDDEN);

        const oldRol = {...rol};
        rol.eliminado = true;
        await this.datasource.transaction(async manager => {
            await manager.save(rol);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldRol, rol));
        })
    }

    public async getLastId(): Promise<number>{
        return (await this.rolRepo.createQueryBuilder('rol')
        .select('MAX(rol.id)', 'lastid')
        .getRawOne()).lastid;
    }

}
