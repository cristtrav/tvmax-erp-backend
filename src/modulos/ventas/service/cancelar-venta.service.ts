import { Cuota } from '@database/entity/cuota.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { Venta } from '@database/entity/venta.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SifenApiUtilService } from '../../sifen/sifen-utils/services/sifen/sifen-api-util.service';
import { SifenEventosUtilService } from '../../sifen/sifen-utils/services/sifen/sifen-eventos-util.service';
import { DTECancelacion } from '@database/entity/facturacion/dte-cancelacion.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { UtilVentaService } from './util-venta.service';

@Injectable()
export class CancelarVentaService {

    constructor(
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(Talonario)
        private talonarioRepo: Repository<Talonario>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(DetalleVenta)
        private detalleVentaRepo: Repository<DetalleVenta>,
        private sifenEventosUtilSrv: SifenEventosUtilService,
        private sifenApiUtilSrv: SifenApiUtilService,
        private datasource: DataSource,
        private utilVentaSrv: UtilVentaService
    ){}

    async cancelar(idventa: number, idusuario: number) {
        const venta = await this.ventaRepo.findOneOrFail({ where: { id: idventa }, relations: { detalles: true } });
        const talonario = await this.talonarioRepo.findOneOrFail({ where: {id: venta.idtalonario}, relations: {timbrado: true} });
        const factElectronica = await this.dteRepo.findOneByOrFail({id: venta.iddte});
        const oldVenta = { ...venta };

        if(!talonario.timbrado.electronico) throw new HttpException({
            message: `Para este documento debe usar la anulación de Factura Preimpresa`
        }, HttpStatus.BAD_REQUEST)
        
        if(
            factElectronica.idestadoDocumentoSifen != EstadoDocumentoSifen.APROBADO &&
            factElectronica.idestadoDocumentoSifen != EstadoDocumentoSifen.APROBADO_CON_OBS
        ) throw new HttpException({
            message: 'No se puede anular. Factura electrónica no aprobada por SIFEN'
        }, HttpStatus.BAD_REQUEST)

        await this.datasource.transaction(async manager => {
            
            venta.anulado = true;    
            await manager.save(venta);
            
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(idusuario, 'M', oldVenta, venta));

            for (let detalle of venta.detalles.filter(deta => deta.idcuota != null)) {
                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                const oldCuota = { ...cuota }
                cuota.pagado = await this.utilVentaSrv.pagoCuotaExists(detalle.idcuota, idventa);
                await manager.save(cuota);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota))
            }

            const oldFactElectronica = { ...factElectronica };
            const [{ idevento }] = await this.datasource.query(`SELECT NEXTVAL('facturacion.seq_id_evento_sifen') AS idevento`);
            const eventoXml = await this.sifenEventosUtilSrv.getCancelacionFactura(idevento, factElectronica)
            const eventoXmlSigned = await this.sifenEventosUtilSrv.getEventoFirmado(eventoXml);
            const cancelacion = new DTECancelacion();
            cancelacion.id = idevento;
            cancelacion.xml = eventoXmlSigned ?? eventoXml;
            cancelacion.fechaHora = new Date();
            cancelacion.iddte = venta.iddte;
            cancelacion.envioCorrecto = false;
            await manager.save(cancelacion);

            if(process.env.SIFEN_DISABLED != 'TRUE')
                await this.sifenApiUtilSrv.enviarCancelacion(cancelacion, manager);
            else console.log('OBS Anulación: SIFEN DESACTIVADO');

            factElectronica.idestadoDocumentoSifen = EstadoDocumentoSifen.CANCELADO;
            await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldFactElectronica, factElectronica));
            await manager.save(factElectronica);
            
        });
    }
    
    //Comprueba si la cuota fue pagada en otra transaccion
    /*private async pagoCuotaExists(idcuota: number, idventaIgnorar: number): Promise<boolean> {
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
    }*/

}
