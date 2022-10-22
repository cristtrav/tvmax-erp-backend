import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Departamento } from '@database/entity/departamento.entity';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';

@Injectable()
export class DepartamentosService {

    constructor(
        @InjectRepository(Departamento)
        private departamentoRepository: Repository<Departamento>,
        private dataSource: DataSource
    ) { }

    private getSelectQuery(queries: any): SelectQueryBuilder<Departamento> {
        const { eliminado, id, sort, offset, limit } = queries;
        let query: SelectQueryBuilder<Departamento> = this.departamentoRepository.createQueryBuilder('departamento');
        if (eliminado) query = query.andWhere('departamento.eliminado = :eliminado', { eliminado });
        if (id && !Array.isArray(id)) query = query.andWhere('departamento.id = :id', { id: id });
        if (id && Array.isArray(id)) query = query.andWhere('departamento.id IN (:...id)', { id: id });
        if (offset) query = query.skip(offset);
        if (limit) query = query.take(limit);
        if (sort) {
            const sortColumn: string = sort.substring(1, sort.length);
            const sortOrder: 'ASC' | 'DESC' = sort.substring(0, 1) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`departamento.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', estadoanterior: any, estadonuevo: any): EventoAuditoria {
        let auditoria: EventoAuditoria = new EventoAuditoria();
        auditoria.idusuario = idusuario;
        auditoria.fechahora = new Date();
        auditoria.idtabla = TablasAuditoriaList.DEPARTAMENTOS.id;
        auditoria.estadoanterior = estadoanterior;
        auditoria.estadonuevo = estadonuevo
        auditoria.operacion = operacion;
        return auditoria;
    }

    public async findAll(queryParams: any): Promise<Departamento[]> {
        return this.getSelectQuery(queryParams).getMany();
    }

    public async count(queryParams: any): Promise<number> {
        return this.getSelectQuery(queryParams).getCount();
    }

    public async create(d: Departamento, idusuario: number) {
        if (await this.departamentoRepository.findOneBy({ id: d.id })) throw new HttpException({
            message: `El Departamento con código «${d.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.dataSource.manager.transaction(async manager => {
            await manager.save(this.getEventoAuditoria(idusuario, 'R', null, d));
            await manager.save(d);
        });
    }

    async update(oldId: string, d: Departamento, idusuario) {
        await this.dataSource.transaction(async manager => {
            const oldDepartamento: Departamento = await this.departamentoRepository.findOneByOrFail({ id: oldId });
            await manager.save(d);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldDepartamento, d));
            if (oldId !== d.id) await manager.remove(oldDepartamento);
        });
    }

    async findById(id: string): Promise<Departamento> {
        return this.departamentoRepository.findOneByOrFail({ id: `${id}` });
    }

    async delete(id: string, idusuario: number) {
        await this.dataSource.transaction(async manager => {

            const dep: Departamento = await this.departamentoRepository.findOneByOrFail({ id: `${id}` });
            const oldDep: Departamento = { ...dep };
            dep.eliminado = true;

            await manager.save(dep);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldDep, dep));
        });
    }

}
