import { Cobro } from '@database/entity/cobro.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { Venta } from '@database/entity/venta.entity';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { FacturaElectronicaUtilsService } from '@modulos/sifen/sifen-utils/services/dte/factura-electronica-utils.service';
import { SifenApiUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-api-util.service';
import { SifenUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-util.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UtilVentaService } from './util-venta.service';

@Injectable()
export class EditarVentaService {

    constructor(
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(DetalleVenta)
        private detalleVentaRepo: Repository<DetalleVenta>,
        @InjectRepository(Talonario)
        private talonarioRepo: Repository<Talonario>,
        @InjectRepository(TalonarioView)
        private talonarioViewRepo: Repository<TalonarioView>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(Cobro)
        private cobroRepo: Repository<Cobro>,
        @InjectRepository(DTE)
        private facturaElectronicaRepo: Repository<DTE>,
        private datasource: DataSource,
        private facturaElectronicaUtilSrv: FacturaElectronicaUtilsService,
        private sifenApiUtilSrv: SifenApiUtilService,
        private sifenUtilsSrv: SifenUtilService,
        private utilVentaSrv: UtilVentaService
    ){}

    async edit(venta: Venta, detalleVenta: DetalleVenta[], idusuario: number) {
        

        const talonarioValidacion = await this.talonarioViewRepo.findOneByOrFail({id: venta.idtalonario});
        const factElectronica = await this.facturaElectronicaRepo.findOneBy({ id: venta.iddte });
        if(
            (talonarioValidacion.electronico && venta.iddte == null) ||
            (talonarioValidacion.electronico && factElectronica == null)
        ) throw new HttpException({
            message: 'No se encontró el documento electrónico (DTE) = null'
        }, HttpStatus.INTERNAL_SERVER_ERROR);

        if(factElectronica &&
            (
                factElectronica.idestadoDocumentoSifen == EstadoDocumentoSifen.APROBADO ||
                factElectronica.idestadoDocumentoSifen == EstadoDocumentoSifen.APROBADO_CON_OBS ||
                factElectronica.idestadoDocumentoSifen == EstadoDocumentoSifen.ENVIADO ||
                factElectronica.idestadoDocumentoSifen == EstadoDocumentoSifen.CANCELADO
            )
        ) throw new HttpException({
            message: 'No se puede editar: Factura electrónica enviada a tributación'
        }, HttpStatus.BAD_REQUEST);

        const oldVenta = await this.ventaRepo.createQueryBuilder('venta')
        .where(`venta.id = :id`, {id: venta.id})
        .andWhere(`venta.eliminado = FALSE`)
        .leftJoinAndSelect(`venta.detalles`, 'detalles', 'detalles.eliminado = FALSE')
        .getOne();

        if(oldVenta.condicion == 'CRE') throw new HttpException({
            message: "Función de editar facturas a crédito aún no disponible"
        }, HttpStatus.INTERNAL_SERVER_ERROR);

        const oldCobro = await this.cobroRepo.findOneBy({ idventa: venta.id, eliminado: false });

        if(!oldVenta) throw new HttpException({
            message: `No se encuentra la venta con código «${venta.id}».`
        }, HttpStatus.NOT_FOUND);

        if(venta.nroFactura != oldVenta.nroFactura || venta.idtalonario != oldVenta.idtalonario){
            const nroFacturaExiste = await this.ventaRepo.createQueryBuilder('venta')
            .where(`venta.eliminado = FALSE`)
            .andWhere(`venta.idtalonario = :idtalonario`, { idtalonario: venta.idtalonario})
            .andWhere(`venta.nroFactura = :nrofactura`, { nrofactura: venta.nroFactura })
            .getOne();
            if(nroFacturaExiste) throw new HttpException({
                message: `La factura ${nroFacturaExiste.nroFactura} ya está registrada.`
            }, HttpStatus.BAD_REQUEST)
        }

        //Validar DV del RUC y corregir de ser necesario
        await this.utilVentaSrv.validarDvRuc(venta.idcliente);

        await this.datasource.transaction(async manager => {
            //Se guarda la venta y el evento en auditoria
            await manager.save(venta);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(idusuario, 'M', oldVenta, venta));

            //Se edita el estado del cobro y se guarda el evento de auditoria
            const cobro = await this.utilVentaSrv.crearCobro(venta, oldCobro.cobradoPor);
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
                .andWhere('venta.idtalonario = :idtalonario');
            ventaNroFacturaQuery.setParameter('idtalonario', venta.idtalonario);
            const ultimoNroTalonarioActual = (await ventaNroFacturaQuery.getRawOne()).ultimonro;

            const talonarioActual = await this.talonarioRepo.findOneOrFail({ where: {id: venta.idtalonario}, relations: {timbrado: true} });
            
            const oldTalonarioActual = { ...talonarioActual };
            talonarioActual.ultimoNroUsado = ultimoNroTalonarioActual;
            await manager.save(talonarioActual);
            await manager.save(Talonario.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldTalonarioActual, talonarioActual));

            if (venta.idtalonario != oldVenta.idtalonario) {
                ventaNroFacturaQuery.setParameter('idtalonario', oldVenta.idtalonario);
                const ultimoNroTalonarioAnterior = (await ventaNroFacturaQuery.getRawOne()).ultimonro;
                const talonarioAnterior = await this.talonarioRepo.findOneByOrFail({ id: oldVenta.idtalonario });
                const oldTalonarioAnterior = { ...talonarioAnterior };
                talonarioAnterior.ultimoNroUsado = ultimoNroTalonarioAnterior;
                await manager.save(talonarioAnterior);
                await manager.save(Talonario.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldTalonarioAnterior, talonarioAnterior));
            }
            if(talonarioActual.timbrado.electronico){
                const factElectRegen = await this.facturaElectronicaUtilSrv.regenerarDTE(venta, detalleVenta);
                await manager.save(factElectRegen);
                await manager.save(DTE.getEventoAuditoria(idusuario, 'M', factElectronica, factElectRegen));
                if(!this.sifenUtilsSrv.isDisabled() &&
                    this.sifenUtilsSrv.getModo() == 'sync'
                )await this.sifenApiUtilSrv.enviar(factElectRegen, manager);
            }
        })
    }

}
