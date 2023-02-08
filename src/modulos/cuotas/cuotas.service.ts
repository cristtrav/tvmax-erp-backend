import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { WhereParam } from '@util/whereparam';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { CobroCuota } from '@dto/cobro-cuota.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cuota } from '@database/entity/cuota.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { CuotaView } from '@database/view/cuota.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';

@Injectable()
export class CuotasService {

    constructor(
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(CuotaView)
        private cuotaViewRepo: Repository<CuotaView>,
        @InjectRepository(CobroCuotasView)
        private cobroCuotaViewRepo: Repository<CobroCuotasView>,
        private datasource: DataSource
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<CuotaView> {
        const { eliminado, pagado, sort, offset, limit, idservicio, idsuscripcion } = queries;
        const alias: string = "cuota";
        let query: SelectQueryBuilder<CuotaView> = this.cuotaViewRepo.createQueryBuilder(alias);

        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (pagado != null) query = query.andWhere(`${alias}.pagado = :pagado`, { pagado });
        if (idsuscripcion)
            if (Array.isArray(idsuscripcion)) query = query.andWhere(`${alias}.idsuscripcion IN (:...idsuscripcion)`, { idsuscripcion });
            else query = query.andWhere(`${alias}.idsuscripcion = :idsuscripcion`, { idsuscripcion });
        if (idservicio)
            if (Array.isArray(idservicio)) query = query.andWhere(`${alias}.idservicio IN (:...idservicio)`, { idservicio });
            else query = query.andWhere(`${alias}.idservicio = :idservicio`, { idservicio });
        if (limit != null) query = query.take(limit);
        if (offset != null) query = query.skip(offset);
        if (sort) {
            const sortColumn: string = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', estadoanterior: any, estadonuevo: any): EventoAuditoria {
        const evento: EventoAuditoria = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.estadoanterior = estadoanterior;
        evento.estadonuevo = estadonuevo;
        evento.fechahora = new Date();
        evento.idtabla = TablasAuditoriaList.CUOTAS.id;
        return evento;
    }

    async findAll(queries: { [name: string]: any }): Promise<CuotaView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    async count(queries): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async findById(id: number): Promise<CuotaView> {
        return this.cuotaViewRepo.findOneByOrFail({ id });
    }

    async create(c: Cuota, idusuario: number) {
        await this.datasource.transaction(async manager => {
            await manager.save(c);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', null, c));
        })
    }

    async edit(oldid: number, c: Cuota, idusuario: number) {
        await this.datasource.transaction(async manager => {
            const oldCuota: Cuota = await this.cuotaRepo.findOneByOrFail({ id: oldid });
            await manager.save(c);
            const newCuota: Cuota = await this.cuotaRepo.findOneByOrFail({ id: c.id });
            await manager.save(this.getEventoAuditoria(idusuario, "M", oldCuota, newCuota));
            if (oldid != c.id) await manager.remove(oldCuota);
        })
    }

    async delete(id: number, idusuario: number) {
        const cuota: Cuota = await this.cuotaRepo.findOneByOrFail({ id });
        const oldCuota: Cuota = { ...cuota };
        cuota.eliminado = true;
        await this.datasource.transaction(async manager => {
            await manager.save(cuota);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldCuota, cuota));
        })
    }

    async findCobro(idcuota: number): Promise<CobroCuotasView> {
        return this.cobroCuotaViewRepo.findOneByOrFail({ idcuota });
    }
}
