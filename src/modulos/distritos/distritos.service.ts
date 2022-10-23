import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { DistritoView } from '@database/view/distritos.view';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Distrito } from '@database/entity/distrito.entity';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';

@Injectable()
export class DistritosService {

    constructor(
        @InjectRepository(DistritoView)
        private distritoViewRepo: Repository<DistritoView>,
        @InjectRepository(Distrito)
        private distritoRepo: Repository<Distrito>,
        private dataSource: DataSource
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<DistritoView> {
        const { eliminado, iddepartamento, id, sort, limit, offset } = queries;
        const entityAlias: string = 'distrito';
        let query: SelectQueryBuilder<DistritoView> = this.distritoViewRepo.createQueryBuilder(entityAlias);

        if (eliminado) query = query.andWhere(`${entityAlias}.eliminado = :eliminado`, { eliminado });
        if (id) query = query.andWhere(
            `${entityAlias}.id ${Array.isArray(id) ? 'IN (...id)' : '= :id'}`,
            { id }
        );
        if (iddepartamento) query = query.andWhere(
            `${entityAlias}.iddepartamento ${Array.isArray(iddepartamento) ? 'IN (...iddepartamento)' : '= :iddepartamento'}`,
            { iddepartamento }
        );
        if (offset) query = query.skip(offset);
        if (limit) query = query.take(limit);
        if (sort) {
            const sortOrder: 'ASC' | 'DESC' = sort.substring(0, 1) === '-' ? 'DESC' : 'ASC';
            const sortColumn: string = sort.substring(1);
            query = query.orderBy(`${entityAlias}.${sortColumn}`, sortOrder)
        }
        return query;
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', estadoAnterior: any, estadoNuevo: any): EventoAuditoria {
        const audit: EventoAuditoria = new EventoAuditoria();
        audit.idusuario = idusuario;
        audit.operacion = operacion;
        audit.fechahora = new Date();
        audit.estadoanterior = estadoAnterior;
        audit.estadonuevo = estadoNuevo;
        audit.idtabla = TablasAuditoriaList.DISTRITOS.id;
        return audit;
    }

    async findAll(queries: { [name: string]: any }): Promise<DistritoView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    async count(queries): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async create(d: Distrito, idusuario: number) {
        const distrito: Distrito = await this.distritoRepo.findOneBy({ id: d.id });
        if (distrito) throw new HttpException({
            message: `El Distrito con código «${d.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.dataSource.transaction(async manager => {
            await manager.save(d);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', null, d));
        });
    }

    async findById(id: string): Promise<DistritoView> {
        return this.distritoViewRepo.findOneByOrFail({ id });
    }

    async edit(oldId: string, d: Distrito, idusuario: number) {
        const oldDistrito: Distrito = await this.distritoRepo.findOneByOrFail({id: oldId});

        await this.dataSource.transaction(async manager=>{
            await manager.save(d);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldDistrito, d));
            if(d.id !== oldDistrito.id) await manager.remove(oldDistrito);
        });
    }

    async delete(id: string, idusuario: number) {
        const distrito: Distrito = await this.distritoRepo.findOneByOrFail({ id });
        const oldDistrito = { ...distrito };
        distrito.eliminado = true;

        await this.dataSource.transaction(async manager => {
            await manager.save(distrito);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldDistrito, distrito));
        });
    }

}
