import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { VentaDTO } from '@dto/venta.dto';
import { Client } from 'pg';
import { DetalleVentaDTO } from '@dto/detalle-venta-dto';
import { WhereParam } from '@util/whereparam';
import { ISearchField } from '@util/isearchfield.interface';
import { IRangeQuery } from '@util/irangequery.interface';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from '@database/entity/venta.entity';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { VentaView } from '@database/view/venta.view';
import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { Timbrado } from '@database/entity/timbrado.entity';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { Cuota } from '@database/entity/cuota.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { Cobro } from '@database/entity/cobro.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Cliente } from '@database/entity/cliente.entity';

@Injectable()
export class VentasService {

    constructor(
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(VentaView)
        private ventaViewRepo: Repository<VentaView>,
        @InjectRepository(DetalleVenta)
        private detalleVentaRepo: Repository<DetalleVenta>,
        @InjectRepository(Timbrado)
        private timbradoRepo: Repository<Timbrado>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(Cliente)
        private clienteRepo: Repository<Cliente>,
        private datasource: DataSource,
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<VentaView> {
        const {
            eliminado,
            search,
            fechainiciofactura,
            fechafinfactura,
            pagado,
            anulado,
            idcobradorcomision,
            idusuarioregistrocobro,
            fechainiciocobro,
            fechafincobro,
            sort,
            offset,
            limit
        } = queries;

        const alias: string = 'venta';
        let query: SelectQueryBuilder<VentaView> = this.ventaViewRepo.createQueryBuilder(alias);

        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (pagado != null) query = query.andWhere(`${alias}.pagado = :pagado`, { pagado });
        if (anulado != null) query = query.andWhere(`${alias}.anulado = :anulado`, { anulado });
        if (fechainiciofactura) query = query.andWhere(`${alias}.fechafactura >= :fechainiciofactura`, { fechainiciofactura });
        if (fechafinfactura) query = query.andWhere(`${alias}.fechafactura <= :fechafinfactura`, { fechafinfactura });
        if (fechainiciocobro) query = query.andWhere(`${alias}.fechacobro >= :fechainiciocobro`, { fechainiciocobro });
        if (fechafincobro) query = query.andWhere(`${alias}.fechafinfactura <= :fechafinfactura`, { fechafinfactura });
        if (idcobradorcomision)
            if (Array.isArray(idcobradorcomision)) query = query.andWhere(`${alias}.idcobradorcomision IN (:...idcobradorcomision)`, { idcobradorcomision });
            else query = query.andWhere(`${alias}.idcobradorcomision = :idcobradorcomision`, { idcobradorcomision });
        if (idusuarioregistrocobro)
            if (Array.isArray(idusuarioregistrocobro)) query = query.andWhere(`${alias}.idusuarioregistrocobro IN (:...idusuarioregistrocobro)`, { idusuarioregistrocobro });
            else query = query.andWhere(`${alias}.idusuarioregistrocobro = :idusuarioregistrocobro`, { idusuarioregistrocobro });
        if (search) {
            query = query.andWhere(new Brackets(qb => {
                qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :searchcli`, { searchcli: `%${search.toLowerCase()}%` });
                if (Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.nrofactura = :searchnrofact`, { searchnrofact: search });
            }));
        }
        if (limit) query = query.take(limit);
        if (offset) query = query.skip(offset);
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(sortColumn, sortOrder);
        }
        return query;
    }

    async create(venta: Venta, detalles: DetalleVenta[], idusuario: number): Promise<number> {
        if (await this.ventaRepo.findOneBy({
            nroFactura: venta.nroFactura,
            idtimbrado: venta.idtimbrado,
            eliminado: false,
            anulado: false
        })) throw new HttpException({
            message: `El número de factura «${venta.nroFactura}» ya está registrado.`
        }, HttpStatus.BAD_REQUEST);

        venta.idusuarioRegistroFactura = idusuario;

        let idventa: number = -1;
        await this.datasource.transaction(async manager => {
            idventa = (await manager.save(venta)).id;
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(idusuario, 'R', null, venta));

            const cobro = await this.createCobro(idventa, venta.idcliente, idusuario);
            await manager.save(cobro);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCobro(3, 'R', null, cobro));

            const timbrado = await this.timbradoRepo.findOneByOrFail({ id: venta.idtimbrado })
            const oldTimbrado = { ...timbrado };
            timbrado.ultimoNroUsado = venta.nroFactura;
            await manager.save(timbrado);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaTimbrado(3, 'M', oldTimbrado, timbrado));

            for (let detalle of detalles) {
                detalle.venta = venta;
                await manager.save(detalle);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaDetalleVenta(idusuario, 'R', null, detalle));
                if (!venta.anulado && !venta.eliminado && detalle.idcuota) {
                    const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                    const oldCuota = { ...cuota };
                    cuota.pagado = true;
                    await manager.save(cuota);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota));
                }
            }
        });
        return idventa
    }

    findAll(queries: { [name: string]: any }): Promise<VentaView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async anular(idventa: number, anulado: boolean, idusuario: number) {
        const venta = await this.ventaRepo.findOneOrFail({ where: { id: idventa }, relations: { detalles: true } });
        const oldVenta = { ...venta };
        venta.anulado = anulado;

        await this.datasource.transaction(async manager => {
            await manager.save(venta);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(idusuario, 'M', oldVenta, venta));

            for (let detalle of venta.detalles.filter(deta => deta.idcuota != null)) {
                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                const oldCuota = { ...cuota }
                cuota.pagado = !venta.anulado && venta.pagado ? true : await this.pagoCuotaExists(detalle.idcuota, idventa);
                if (cuota.pagado != oldCuota.pagado) {
                    await manager.save(cuota);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota))
                };
            }
        });
    }

    async delete(id: number, idusuario: number) {
        const venta = await this.ventaRepo.findOneOrFail({ where: { id }, relations: { detalles: true } })
        const oldVenta = { ...venta };
        venta.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(venta);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(idusuario, 'E', oldVenta, venta));
            for (let detalle of venta.detalles.filter(deta => deta.idcuota != null)) {
                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                const oldCuota = { ...cuota }
                cuota.pagado = await this.pagoCuotaExists(detalle.idcuota, id);
                if (cuota.pagado != oldCuota.pagado) {
                    await manager.save(cuota);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota))
                };
            }
        });
    }

    async findById(id: number): Promise<VentaView> {
        return this.ventaViewRepo.findOneByOrFail({ id });
    }

    private async createCobro(idventa: number, idcliente: number, idusuario: number): Promise<Cobro> {
        const cobro = new Cobro();
        cobro.cobradoPor = idusuario;
        cobro.fecha = new Date();
        cobro.idventa = idventa;
        cobro.comisionPara = (await this.clienteRepo.findOneByOrFail({ id: idcliente })).idcobrador;
        return cobro;
    }

    private async pagoCuotaExists(idcuota: number, idventaIgnorar: number): Promise<boolean> {
        const detalleQuery = this.detalleVentaRepo.createQueryBuilder('detalle')
            .innerJoin(`detalle.cuota`, 'cuota', 'detalle.eliminado = :dveliminado', { dveliminado: false })
            .innerJoin(
                `detalle.venta`,
                'venta',
                'venta.eliminado = :veliminada AND venta.anulado = :vanulada AND venta.pagado = :vpagado AND venta.id != :idventaIgnorar',
                { veliminada: false, vanulada: false, vpagado: true, idventaIgnorar }
            )
            .where('detalle.idcuota = :idcuota', { idcuota });
        return (await detalleQuery.getCount()) != 0;
    }

}
