import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Domicilio } from '@database/entity/domicilio.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { DomicilioView } from '@database/view/domicilio.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';

@Injectable()
export class DomiciliosService {

    constructor(
        @InjectRepository(Domicilio)
        private domicilioRepo: Repository<Domicilio>,
        @InjectRepository(DomicilioView)
        private domicilioViewRepo: Repository<DomicilioView>,
        private datasource: DataSource
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<DomicilioView> {
        const { eliminado, idcliente, sort, offset, limit } = queries;
        const alias = 'domicilio';
        let query = this.domicilioViewRepo.createQueryBuilder(alias);
        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (idcliente) query = query.andWhere(`${alias}.idcliente ${Array.isArray(idcliente) ? 'IN (:...idcliente)' : '= :idcliente'}`, { idcliente });
        if (limit) query = query.take(limit);
        if (offset) query = query.skip(offset)
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', oldValue: any, newValue: any): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.fechahora = new Date();
        evento.idtabla = TablasAuditoriaList.DOMICILIOS.id;
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

    findAll(queries: { [name: string]: any }): Promise<DomicilioView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async getLastId(): Promise<number> {
        return (await this.domicilioRepo.createQueryBuilder('domicilio')
            .select(`MAX(domicilio.id)`, 'lastid')
            .getRawOne()).lastid;
    }

    async create(d: Domicilio, idusuario: number) {
        const oldDomicilio = await this.domicilioRepo.findOneBy({ id: d.id });
        if (oldDomicilio) throw new HttpException({
            message: `El domicilio con código «${d.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {

            if (d.principal) {
                const domicilios = await this.domicilioRepo.findBy({ idcliente: d.idcliente, eliminado: false });
                for(let domicilio of domicilios) {
                    domicilio.principal = false;
                    await manager.save(domicilio);
                };
            }
            await manager.save(d);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', oldDomicilio, d));
        });
    }

    async edit(oldId: number, d: Domicilio, idusuario: number) {
        const oldDomicilio = await this.domicilioRepo.findOneByOrFail({ id: oldId });

        if (oldId != d.id && await this.domicilioRepo.findOneBy({ id: d.id, eliminado: false })) throw new HttpException({
            message: `El domicilio con código «${d.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            if (d.principal) {
                const domicilios = await this.domicilioRepo.findBy({ idcliente: d.idcliente, eliminado: false });
                for(let domicilio of domicilios) {
                    domicilio.principal = false;
                    await manager.save(domicilio);
                }
            }
            await manager.save(d);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldDomicilio, d));
            if(oldId != d.id) await manager.remove(oldDomicilio);
        });
    }

    async findById(id: number): Promise<DomicilioView> {
        return this.domicilioViewRepo.findOneByOrFail({id});
    }

    async delete(id: number, idusuario: number) {
        const domicilio = await this.domicilioRepo.findOneByOrFail({id});
        const oldDomicilio = { ...domicilio }
        domicilio.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(domicilio);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldDomicilio, domicilio));
        });
    }

}
