import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from '@database/entity/venta.entity';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { VentaView } from '@database/view/venta.view';
import { Timbrado } from '@database/entity/timbrado.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { Cobro } from '@database/entity/cobro.entity';
import { Cliente } from '@database/entity/cliente.entity';

const appendIdOnSort: string[] = [
    "fechafactura",
    "fechacobro",
    "ci",
    "cliente",
    "total"
]

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
        @InjectRepository(Cobro)
        private cobroRepo: Repository<Cobro>,
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
            limit,
            idtimbrado,
            nrofactura
        } = queries;

        const alias: string = 'venta';
        let query: SelectQueryBuilder<VentaView> = this.ventaViewRepo.createQueryBuilder(alias);

        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (pagado != null) query = query.andWhere(`${alias}.pagado = :pagado`, { pagado });
        if (anulado != null) query = query.andWhere(`${alias}.anulado = :anulado`, { anulado });
        if (fechainiciofactura) query = query.andWhere(`${alias}.fechafactura >= :fechainiciofactura`, { fechainiciofactura });
        if (fechafinfactura) query = query.andWhere(`${alias}.fechafactura <= :fechafinfactura`, { fechafinfactura });
        if (fechainiciocobro) query = query.andWhere(`${alias}.fechacobro >= :fechainiciocobro`, { fechainiciocobro });
        if (fechafincobro) query = query.andWhere(`${alias}.fechacobro <= :fechafincobro`, { fechafincobro });
        if (nrofactura) query = query.andWhere(`${alias}.nrofactura = :nrofactura`, { nrofactura });
        if (idtimbrado) query = query.andWhere(`${alias}.idtimbrado = :idtimbrado`, { idtimbrado });
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
            if(sortColumn === 'nrofactura'){
                query = query.orderBy(`${alias}.prefijofactura`, sortOrder);
                query = query.addOrderBy(`${alias}.nrofactura`, sortOrder);
            }else query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(appendIdOnSort.includes(sortColumn)) query = query.addOrderBy(`${alias}.id`, sortOrder);
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

            const cobro = await this.createCobro(venta, idusuario);
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

    async edit(venta: Venta, detalleVenta: DetalleVenta[], idusuario: number) {
        const oldVenta = await this.ventaRepo.createQueryBuilder('venta')
        .where(`venta.id = :id`, {id: venta.id})
        .andWhere(`venta.eliminado = FALSE`)
        .leftJoinAndSelect(`venta.detalles`, 'detalles', 'detalles.eliminado = FALSE')
        .getOne();
        const oldCobro = await this.cobroRepo.findOneBy({ idventa: venta.id, eliminado: false });

        if(!oldVenta) throw new HttpException({
            message: `No se encuentra la venta con código «${venta.id}».`
        }, HttpStatus.NOT_FOUND);

        await this.datasource.transaction(async manager => {
            //Se guarda la venta y el evento en auditoria
            await manager.save(venta);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(idusuario, 'M', oldVenta, venta));

            //Se edita el estado del cobro y se guarda el evento de auditoria
            const cobro = await this.createCobro(venta, oldCobro.cobradoPor);
            cobro.id = oldCobro.id;
            await manager.save(cobro);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCobro(3, 'M', oldCobro, cobro));

            //Se ubican los detalles eliminados y se marcan como eliminados, y las cuotas se marcan como pendientes
            for (let detalle of oldVenta.detalles.filter(oldDv => !detalleVenta.find(dv => dv.id == oldDv.id))) {
                if (detalle.idcuota != null) {
                    const cuota = await this.cuotaRepo.findOneBy({ id: detalle.idcuota });
                    const oldCuota = { ...cuota };
                    cuota.pagado = false;
                    await manager.save(cuota);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota));
                }
                const oldDetalle = { ...detalle };
                detalle.eliminado = true;
                await manager.save(detalle);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaDetalleVenta(idusuario, 'E', oldDetalle, detalle));
            }

            //Se marca como pagadas las cuotas en los detalles nuevos agregados
            for (let detalle of detalleVenta.filter(dv => dv.id == null && dv.idcuota != null)) {
                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                const oldCuota = { ...cuota };
                cuota.pagado = true;
                await manager.save(cuota);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota));
            }

            //Se guardan los nuevos detalles de la venta y el evento de auditoria
            for (let detalle of detalleVenta) {
                detalle.venta = venta;
                const oldDetalle = await this.detalleVentaRepo.findOneBy({ id: detalle.id });
                await manager.save(detalle);
                if (oldDetalle) await manager.save(EventoAuditoriaUtil.getEventoAuditoriaDetalleVenta(idusuario, 'M', oldDetalle, detalle));
                else await manager.save(EventoAuditoriaUtil.getEventoAuditoriaDetalleVenta(idusuario, 'R', null, detalle));
            }

            //Se marcan las cuotas nuevas en el detalles como pagadas y se registran sus eventos de auditoria
            for (
                let detalle of
                detalleVenta.filter(dv => dv.idcuota != null && !oldVenta.detalles.find(olddv => olddv.idcuota == dv.idcuota))
            ) {
                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                const oldCuota = { ...cuota };
                cuota.pagado = true;
                await manager.save(cuota);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota));
            }

            //Se actualiza el numero utilizado de los timbrados, el anterior y el nuevo;
            const ventaRepository = manager.getRepository(Venta);
            let ventaNroFacturaQuery = ventaRepository.createQueryBuilder('venta')
                .select('MAX(venta.nroFactura)', 'ultimonro')
                .where('venta.eliminado = false')
                .andWhere('venta.anulado = false')
                .andWhere('venta.idtimbrado = :idtimbrado');
            ventaNroFacturaQuery.setParameter('idtimbrado', venta.idtimbrado);
            const ultimoNroTimbradoActual = (await ventaNroFacturaQuery.getRawOne()).ultimonro;

            const timbradoActual = await this.timbradoRepo.findOneByOrFail({ id: venta.idtimbrado });
            const oldTimbradoActual = { ...timbradoActual };
            timbradoActual.ultimoNroUsado = ultimoNroTimbradoActual;
            await manager.save(timbradoActual);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaTimbrado(3, 'M', oldTimbradoActual, timbradoActual));

            if (venta.idtimbrado != oldVenta.idtimbrado) {
                ventaNroFacturaQuery.setParameter('idtimbrado', oldVenta.idtimbrado);
                const ultimoNroTimbradoAnterior = (await ventaNroFacturaQuery.getRawOne()).ultimonro;
                const timbradoAnterior = await this.timbradoRepo.findOneByOrFail({ id: oldVenta.idtimbrado });
                const oldTimbradoAnterior = { ...timbradoAnterior };
                timbradoAnterior.ultimoNroUsado = ultimoNroTimbradoAnterior;
                await manager.save(timbradoAnterior);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaTimbrado(3, 'M', oldTimbradoAnterior, timbradoAnterior));
            }
        })

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

    private async createCobro(venta: Venta, idusuario: number): Promise<Cobro> {
        const cobro = new Cobro();
        cobro.cobradoPor = idusuario;
        cobro.fecha = venta.fechaFactura;
        cobro.idventa = venta.id;
        cobro.comisionPara = (await this.clienteRepo.findOneByOrFail({ id: venta.idcliente })).idcobrador;
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
