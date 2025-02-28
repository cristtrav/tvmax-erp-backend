import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { NotaCreditoDetalle } from '@database/entity/facturacion/nota-credito-detalle.entity';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { Venta } from '@database/entity/venta.entity';
import { NotaCreditoView } from '@database/view/facturacion/nota-credito.view';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { NotaCreditoElectronicaUtilsService } from '@modulos/sifen/sifen-utils/services/dte/nota-credito-electronica-utils.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class AnularVentaNotacreditoService {

    constructor(
        @InjectRepository(Venta)
        private ventaSrv: Repository<Venta>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        @InjectRepository(DetalleVenta)
        private detalleVentaRepo: Repository<DetalleVenta>,
        @InjectRepository(Talonario)
        private talonarioRepo: Repository<Talonario>,
        @InjectRepository(TalonarioView)
        private talonarioViewRepo: Repository<TalonarioView>,
        @InjectRepository(NotaCreditoView)
        private notaCreditoViewRepo: Repository<NotaCreditoView>,
        private notaCreditoUtlsSrv: NotaCreditoElectronicaUtilsService,
        private datasource: DataSource
    ){}

    public async anularNC(idventa: number, idusuario: number){
        const venta = await this.ventaSrv.findOneByOrFail({id: idventa});
        const facturaElec = await this.dteRepo.findOneByOrFail({id: venta.iddte});
        const detallesVenta = await this.detalleVentaRepo.findBy({ idventa: idventa, eliminado: false});
        const talonVenta = await this.talonarioViewRepo.findOneByOrFail({id: venta.idtalonario});
        const prefijoTalonVenta = `${talonVenta.codestablecimiento.toString().padStart(3, '0')}-${talonVenta.codpuntoemision.toString().padStart(3, '0')}`;
        const talonNotaView = await this.talonarioViewRepo.findOneBy({
            codpuntoemision: talonVenta.codpuntoemision,
            codestablecimiento: talonVenta.codestablecimiento,
            eliminado: false,
            activo: true,
            electronico: talonVenta.electronico,
            tipodocumento: 'NCR'
        });

        if(talonNotaView == null) throw new HttpException({
            message: `No se encontró talonario para nota de crédito con prefijo ${prefijoTalonVenta}.`
        }, HttpStatus.INTERNAL_SERVER_ERROR)

        if(
            facturaElec.idestadoDocumentoSifen != EstadoDocumentoSifen.APROBADO &&
            facturaElec.idestadoDocumentoSifen != EstadoDocumentoSifen.APROBADO_CON_OBS
        ) throw new HttpException({
            message: 'La factura electrónica no está aprobada por SIFEN'
        }, HttpStatus.BAD_REQUEST);

        const nota = await this.notaCreditoViewRepo
            .createQueryBuilder('nota')
            .where(`nota.idventa = :idventa`, { idventa })
            .andWhere(`nota.eliminado = false`)
            .andWhere(`nota.anulado = false`)
            .andWhere(new Brackets(qb => {
                qb = qb.orWhere(`nota.idestadodte = :estadoAprobado`, { estadoAprobado: EstadoDocumentoSifen.APROBADO });
                qb = qb.orWhere(`nota.idestadodte = :estadoAprobadoConObs`, { estadoAprobadoConObs: EstadoDocumentoSifen.APROBADO_CON_OBS });
                qb = qb.orWhere(`nota.idestadodte = :estadoNoEnviado`, { estadoNoEnviado: EstadoDocumentoSifen.NO_ENVIADO });
            })).getOne();

        if(nota != null) throw new HttpException({
            message: `Ya fue generada una nota de crédito (Nro.: ${nota.prefijonota}-${nota.nronota.toString().padStart(7, '0')})`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {

            let nota = new NotaCredito();
            nota.anulado = false;
            nota.fechaHora = new Date();
            nota.idcliente = venta.idcliente;
            nota.idtalonario = talonNotaView.id;
            nota.idventa = venta.id;
            nota.nroNota = (Number(talonNotaView.ultimonrousado ?? 0)) + 1
            nota.total = venta.total;
            nota.totalExentoIva = venta.totalExentoIva;
            nota.totalGravadoIva10 = venta.totalGravadoIva10;
            nota.totalGravadoIva5 = venta.totalGravadoIva5;
            nota.totalIva10 = venta.totalIva10;
            nota.totalIva5;
            nota.eliminado = false;
            
            const detallesNota: NotaCreditoDetalle[] = detallesVenta.map(dv => {
                let detalleNota = new NotaCreditoDetalle();
                detalleNota.cantidad = dv.cantidad;
                detalleNota.descripcion = `ANULACION | ${dv.descripcion}`;
                detalleNota.monto = dv.monto;
                detalleNota.subtotal = dv.subtotal;
                detalleNota.eliminado = false;
                detalleNota.idcuota = dv.idcuota;
                detalleNota.idservicio = dv.idservicio;
                detalleNota.idsuscripcion = dv.idsuscripcion;
                detalleNota.montoIva = dv.montoIva;
                detalleNota.porcentajeIva = dv.porcentajeIva;            
                return detalleNota;
            });

            let dte = await this.notaCreditoUtlsSrv.generarDTE(nota, detallesNota);
            dte = await manager.save(dte);

            nota.iddte = dte.id;
            nota = await manager.save(nota);
            await manager.save(NotaCredito.getEventoAuditoria(idusuario, 'R', null, nota));

            for(let dn of detallesNota){
                dn.idnotaCredito = nota.id;
                await manager.save(dn);
                await manager.save(NotaCreditoDetalle.getEventoAuditoria(idusuario, 'R', null, dn));
            }

            const talonNota = await this.talonarioRepo.findOneByOrFail({id: talonNotaView.id});
            const oldTalonNota = { ...talonNota };
            talonNota.ultimoNroUsado = nota.nroNota;
            await manager.save(talonNota);
            await manager.save(Talonario.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldTalonNota, talonNota));

                        
        });
    }

}
