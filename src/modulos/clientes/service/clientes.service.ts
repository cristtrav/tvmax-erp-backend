import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Cliente } from '@database/entity/cliente.entity';
import { ClienteView } from '@database/view/cliente.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';

@Injectable()
export class ClientesService {

    constructor(
        @InjectRepository(Cliente)
        private clienteRepo: Repository<Cliente>,
        @InjectRepository(ClienteView)
        private clienteViewRepo: Repository<ClienteView>,
        private datasource: DataSource
    ) { }

    private getSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<ClienteView>{
        const {
                eliminado,
                search,
                idcobrador,
                idbarrio,
                iddistrito,
                iddepartamento,
                sort,
                offset,
                limit,
                ci,
                excluidosorteo
            } = queries;        
        const alias = 'cliente';
        let query: SelectQueryBuilder<ClienteView> = this.clienteViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if(idcobrador) query = query.andWhere(`${alias}.idcobrador ${Array.isArray(idcobrador)?'IN (:...idcobrador)':'= :idcobrador'}`, {idcobrador});
        if(idbarrio) query = query.andWhere(`${alias}.idbarrio ${Array.isArray(idbarrio) ? 'IN (:...idbarrio)' : '= :idbarrio'}`, {idbarrio});
        if(iddistrito) query = query.andWhere(`${alias}.iddistrito ${Array.isArray(iddistrito) ? 'IN (:...iddistrito)' : '= :iddistrito'}`, {iddistrito});
        if(iddepartamento) query = query.andWhere(`${alias}.iddepartamento ${Array.isArray(iddepartamento) ? 'IN (:...iddepartamento)' : '= :iddepartamento'}`, {iddepartamento});
        if(ci) query = query.andWhere(`${alias}.ci = :ci`, {ci});
        if(excluidosorteo != null) query = query.andWhere(`${alias}.excluidosorteo = :excluidosorteo`, {excluidosorteo});
        if(search) query = query.andWhere(
            new Brackets(qb => {
                qb = qb.orWhere(`LOWER(${alias}.nombres) LIKE :nombsearch`, { nombsearch: `%${search.toLowerCase()}%`});
                qb = qb.orWhere(`LOWER(${alias}.apellidos) LIKE :apellsearch`, {apellsearch: `%${search.toLowerCase()}%`});
                qb = qb.orWhere(`LOWER(${alias}.razonsocial) LIKE :rssearch`, {rssearch: `%${search.toLowerCase()}%`});
                qb = qb.orWhere(`${alias}.ci = :cisearch`, {cisearch: search});
                if(Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, {idsearch: Number(search)});
            })
        );
        if(offset) query = query.skip(offset);
        if(limit) query = query.take(limit);
        if(sort){
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    findAll(queries: {[name: string]: any}): Promise<ClienteView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: {[name: string]: any}): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async create(c: Cliente, idusuario: number) {
        const oldCli = await this.clienteRepo.findOneBy({id: c.id});
        if(oldCli && !oldCli.eliminado) throw new HttpException({
            message: `El cliente con código «${c.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(c);
            await manager.save(Cliente.getEventoAuditoria(idusuario, 'R', oldCli, c));
        });
    }

    async getLastId(): Promise<number> {
        return (await this.clienteRepo.createQueryBuilder('cliente')
        .select(`MAX(cliente.id)`, 'lastid')
        .getRawOne()).lastid;
    }

    async findById(id: number): Promise<ClienteView> {
        return this.clienteViewRepo.findOneByOrFail({id});
    }

    async edit(oldId: number, c: Cliente, idusuario: number) {
        const oldCliente = await this.clienteRepo.findOneByOrFail({id: oldId});

        if(oldId != c.id && await this.clienteRepo.findOneBy({id: c.id, eliminado: false})) throw new HttpException({
            message: `El cliente con código «${c.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(c);
            await manager.save(Cliente.getEventoAuditoria(idusuario, 'M', oldCliente, c));            
            if(oldId != c.id) await manager.remove(oldCliente);
        });
    }

    async delete(id: number, idusuario: number) {
        const cliente = await this.clienteRepo.findOneByOrFail({id: id});
        const oldCliente = { ...cliente };
        cliente.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(cliente);
            await manager.save(Cliente.getEventoAuditoria(idusuario, 'E', oldCliente, cliente));
        });
    }

    async editContacto(id: number, contacto: {email: string, telefono1: string, telefono2: string}, idusuario: number){
        const cliente = await this.clienteRepo.findOneByOrFail({ id });
        const oldCliente = { ...cliente };

        cliente.telefono1 = contacto.telefono1;
        cliente.telefono2 = contacto.telefono2;
        cliente.email = contacto.email;
        
        await this.datasource.transaction(async manager => {
            await manager.save(Cliente.getEventoAuditoria(idusuario, 'M', oldCliente, cliente));
            await manager.save(cliente);
        });
    }

}
