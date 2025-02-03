import { Cuota } from '@database/entity/cuota.entity';
import { DTECancelacion } from '@database/entity/facturacion/dte-cancelacion.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { NotaCreditoDetalle } from '@database/entity/facturacion/nota-credito-detalle.entity';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { Venta } from '@database/entity/venta.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { SifenApiUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-api-util.service';
import { SifenEventosUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-eventos-util.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CancelarNotaCreditoService {

    constructor(
        @InjectRepository(NotaCredito)
        private notaCreditoRepo: Repository<NotaCredito>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        @InjectRepository(NotaCreditoDetalle)
        private notaCreditoDetalleRepo: Repository<NotaCreditoDetalle>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        private datasource: DataSource,
        private sifenEventosUtilSrv: SifenEventosUtilService,
        private sifenApiUtilSrv: SifenApiUtilService
    ){}

    async cancelarNotaCredito(idnota: number, idusuario: number){
        const nota = await this.notaCreditoRepo.findOneByOrFail({ id: idnota });
        const notaDetalles = await this.notaCreditoDetalleRepo.findBy({ idnotaCredito: nota.id, eliminado: false });
        const oldNota = { ...nota };
        const venta = await this.ventaRepo.findOneByOrFail({ id: nota.idventa });
        const oldVenta = { ...venta };
        const dte = await this.dteRepo.findOneByOrFail({ id: nota.iddte });

        if(
            dte.idestadoDocumentoSifen != EstadoDocumentoSifen.APROBADO &&
            dte.idestadoDocumentoSifen != EstadoDocumentoSifen.APROBADO_CON_OBS
        ) throw new HttpException({
            message: 'La nota de crédito no está aprobada por SIFEN'
        }, HttpStatus.INTERNAL_SERVER_ERROR);

        await this.datasource.transaction(async manager => {
            nota.anulado = true;    
            await manager.save(nota);
            await manager.save(NotaCredito.getEventoAuditoria(idusuario, 'M', oldNota, nota));

            venta.anulado = false;
            await manager.save(venta);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(Usuario.ID_USUARIO_SISTEMA, 'M', oldVenta, venta));

            for (let detalle of notaDetalles.filter(deta => deta.idcuota != null)) {
                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                const oldCuota = { ...cuota }
                cuota.pagado = true;
                await manager.save(cuota);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota))
            }

            const oldDte = { ...dte };
            const [{ idevento }] = await this.datasource.query(`SELECT NEXTVAL('facturacion.seq_id_evento_sifen') AS idevento`);
            const eventoXml = await this.sifenEventosUtilSrv.getCancelacionNotaCredito(idevento, dte)
            const eventoXmlSigned = await this.sifenEventosUtilSrv.getEventoFirmado(eventoXml);
            const cancelacion = new DTECancelacion();
            cancelacion.id = idevento;
            cancelacion.xml = eventoXmlSigned ?? eventoXml;
            cancelacion.fechaHora = new Date();
            cancelacion.iddte = nota.iddte;
            cancelacion.envioCorrecto = false;
            await manager.save(cancelacion);

            if(process.env.SIFEN_DISABLED != 'TRUE')
                await this.sifenApiUtilSrv.enviarCancelacion(cancelacion, manager);
            else console.log('OBS Anulación: SIFEN DESACTIVADO');

            dte.idestadoDocumentoSifen = EstadoDocumentoSifen.CANCELADO;
            await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldDte, dte));
            await manager.save(dte);
        });
    }
}
