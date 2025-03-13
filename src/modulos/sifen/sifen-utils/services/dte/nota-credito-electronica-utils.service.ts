import { DTE } from '@database/entity/facturacion/dte.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { EstadoEnvioEmail } from '@database/entity/facturacion/estado-envio-email.entity.dto';
import { Venta } from '@database/entity/venta.entity';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEDataInterface } from '../../interfaces/dte/de-data.interface';
import { DEItemInterface } from '../../interfaces/dte/de-item.interface';
import { DteUtilsService } from './dte-utils.service';
import xmlgen from 'facturacionelectronicapy-xmlgen';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { NotaCreditoDetalle } from '@database/entity/facturacion/nota-credito-detalle.entity';
import { DEDocumentoAsociadoInterface } from '../../interfaces/dte/de-documento-asociado.interface';
import { DteXmlUtilsService } from './dte-xml-utils.service';

@Injectable()
export class NotaCreditoElectronicaUtilsService {

    constructor(
        @InjectRepository(TalonarioView)
        private talonarioViewRepo: Repository<TalonarioView>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        private dteUtilsSrv: DteUtilsService,
        private dteXmlUtils: DteXmlUtilsService
    ) { }

    public async generarDE(nota: NotaCredito, detalles: NotaCreditoDetalle[]): Promise<string> {
        const talonario = await this.talonarioViewRepo.findOneByOrFail({id: nota.idtalonario});
        return await xmlgen.generateXMLDE(
            await this.dteUtilsSrv.getParams(talonario),
            await this.getData(nota, detalles, talonario),
            { test: false, redondeoSedeco: false, sum0_000001SuffixBeforeToFixed: false }
        );
    }

    private async getData(nota: NotaCredito, detalles: NotaCreditoDetalle[], talonario: TalonarioView): Promise<DEDataInterface> {
        return {
            tipoDocumento: 5,
            establecimiento: `${talonario.codestablecimiento}`.padStart(3, '0'),
            punto: `${talonario.codpuntoemision}`.padStart(3, '0'),
            numero: `${nota.nroNota}`.padStart(7, '0'),
            codigoSeguridadAleatorio: this.dteUtilsSrv.generarCodigoSeguridadAleatorio(),
            fecha: this.dteUtilsSrv.formatDate(nota.fechaHora ?? new Date()),
            tipoEmision: 1,
            tipoTransaccion: 2,
            tipoImpuesto: 1,
            moneda: 'PYG',
            cliente: await this.dteUtilsSrv.getCliente(nota.idcliente),
            factura: { presencia: 1 },
            condicion: {
                tipo: 1,
                entregas: [{
                    tipo: 1,
                    moneda: 'PYG',
                    monto: `${nota.total}`,
                    cambio: 0
                }]
            },
            items: this.getItems(detalles),
            documentoAsociado: await this.getDocumentoAsociado(nota.idventa),
            notaCreditoDebito: {
                motivo: 1
            }
        }
    }

    private getItems(detalles: NotaCreditoDetalle[]): DEItemInterface[]{
        const items: DEItemInterface[] = [];
        for(let detalle of detalles){
            items.push({
                codigo: `${detalle.idservicio}`,
                descripcion: detalle.descripcion,
                unidadMedida: 77,
                cantidad: detalle.cantidad,
                precioUnitario: detalle.monto,
                pais: "PRY",
                paisDescripcion: "Paraguay",
                ivaTipo: 1,
                ivaBase: 100,
                iva: <0 | 5 | 10> detalle.porcentajeIva
            });
        }
        return items;
    }

    private async getDocumentoAsociado(idventa: number): Promise<DEDocumentoAsociadoInterface>{
        const venta = await this.ventaRepo.findOneByOrFail({id: idventa});
        const talonView = await this.talonarioViewRepo.findOneByOrFail({ id: venta.idtalonario });
        const dteAsoc = await this.dteRepo.findOneByOrFail({id: venta.iddte});
        const fechaVenta = venta.fechaHoraFactura ?? venta.fechaFactura;
        return {
            formato: 1,
            tipo: 5,
            cdc: this.dteXmlUtils.getCDC(dteAsoc.xml),
            establecimiento: talonView.codestablecimiento.toString().padStart(3, '0'),
            punto: talonView.codpuntoemision.toString().padStart(3, '0'),
            numero: venta.nroFactura.toString().padStart(7,'0'),
            fecha: `${fechaVenta.getFullYear()}-${fechaVenta.getMonth() + 1}-${fechaVenta.getDate()}`,
            timbrado: talonView.nrotimbrado.toString()
        }
    }

    public async generarDTE(nota: NotaCredito, detalles: NotaCreditoDetalle[]): Promise<DTE> {
        const dte = new DTE();
        dte.tipoDocumento = 'NCR';
        dte.idestadoDocumentoSifen = EstadoDocumentoSifen.NO_ENVIADO;
        dte.version = 1;
        dte.fechaCambioEstado = new Date();
        
        const xmlDE = await this.generarDE(nota, detalles);
        const signedXmlDE = await this.dteUtilsSrv.generarDEFirmado(xmlDE);
        const signedWithQRXmlDE = await this.dteUtilsSrv.generarDEConQR(signedXmlDE);

        dte.xml = signedWithQRXmlDE ?? signedXmlDE ?? xmlDE;
        dte.firmado = signedXmlDE != null;
        dte.idestadoEnvioEmail = EstadoEnvioEmail.NO_ENVIADO;
        dte.fechaCambioEstadoEnvioEmaill = new Date();
        dte.intentoEnvioEmail = 0;

        return dte;
    }

    

    /*public async regenerarDTE(nota: NotaCredito, detalles: NotaCreditoDetalle[]): Promise<DTE> {
        
        const dte = await this.dteRepo.findOneByOrFail({ id: nota.iddte });
        dte.version = dte.version + 1;
        
        dte.idestadoDocumentoSifen = EstadoDocumentoSifen.NO_ENVIADO;
        dte.fechaCambioEstado = new Date();
        
        const xmlDE = await this.generarDE(nota, detalles);
        const signedXmlDE = await this.dteUtilsSrv.generarDEFirmado(xmlDE);
        const signedWithQRXmlDE = await this.dteUtilsSrv.generarDEConQR(signedXmlDE);

        dte.xml = signedWithQRXmlDE ?? signedXmlDE ?? xmlDE;
        dte.firmado = signedXmlDE != null;
        dte.idestadoEnvioEmail = EstadoEnvioEmail.NO_ENVIADO;
        dte.fechaCambioEstadoEnvioEmaill = new Date();
        dte.intentoEnvioEmail = 0;

        return dte;
    }*/

}
