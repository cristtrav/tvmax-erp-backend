import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { Venta } from '@database/entity/venta.entity';
import { Injectable } from '@nestjs/common';
import xmlgen from 'facturacionelectronicapy-xmlgen';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { EstadoEnvioEmail } from '@database/entity/facturacion/estado-envio-email.entity.dto';
import { DteUtilsService } from '@modulos/sifen/sifen-utils/services/dte/dte-utils.service';
import { DEDataInterface } from '../../interfaces/dte/de-data.interface';
import { DEItemInterface } from '../../interfaces/dte/de-item.interface';
import { XmlgenConfig } from 'facturacionelectronicapy-xmlgen/dist/services/type.interface.';

@Injectable()
export class FacturaElectronicaUtilsService {

    constructor(
        @InjectRepository(TalonarioView)
        private talonarioViewRepo: Repository<TalonarioView>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        private dteUtilsSrv: DteUtilsService
    ) { }

    public async generarDE(venta: Venta, detalles: DetalleVenta[]): Promise<string> {
        const talonario = await this.talonarioViewRepo.findOneByOrFail({id: venta.idtalonario});
        return await xmlgen.generateXMLDE(
            await this.dteUtilsSrv.getParams(talonario),
            await this.getData(venta, detalles, talonario),
            { test: false, redondeoSedeco: false, sum0_000001SuffixBeforeToFixed: false }
        );
    }

    private async getData(venta: Venta, detalles: DetalleVenta[], talonario: TalonarioView): Promise<DEDataInterface> {
        return {
            tipoDocumento: 1,
            establecimiento: `${talonario.codestablecimiento}`.padStart(3, '0'),
            punto: `${talonario.codpuntoemision}`.padStart(3, '0'),
            numero: `${venta.nroFactura}`.padStart(7, '0'),
            codigoSeguridadAleatorio: this.dteUtilsSrv.generarCodigoSeguridadAleatorio(),
            fecha: this.dteUtilsSrv.formatDate(venta.fechaHoraFactura ?? venta.fechaFactura ?? new Date()),
            tipoEmision: 1,
            tipoTransaccion: 2,
            tipoImpuesto: 1,
            moneda: 'PYG',
            cliente: await this.dteUtilsSrv.getCliente(venta.idcliente),
            factura: { presencia: 1 },
            condicion: {
                tipo: venta.condicion == 'CON' ? 1 : 2,
                entregas: venta.condicion == 'CON' ? [{
                    tipo: 1,
                    moneda: 'PYG',
                    monto: `${venta.total}`,
                    cambio: 0
                }] : undefined,
                credito: venta.condicion == 'CRE' ? {
                    tipo: 1,
                    plazo: "Indefinido"
                } : undefined
            },
            items: this.getItems(detalles)
        }
    }

    private getItems(detalles: DetalleVenta[]): DEItemInterface[]{
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

    public async generarDTE(venta: Venta, detalles: DetalleVenta[]): Promise<DTE> {
        const dte = new DTE();
        dte.tipoDocumento = 'FAC';
        dte.idestadoDocumentoSifen = EstadoDocumentoSifen.NO_ENVIADO;
        dte.version = 1;
        dte.fechaCambioEstado = new Date();
        
        const xmlDE = await this.generarDE(venta, detalles);
        const signedXmlDE = await this.dteUtilsSrv.generarDEFirmado(xmlDE);
        const signedWithQRXmlDE = await this.dteUtilsSrv.generarDEConQR(signedXmlDE);

        dte.xml = signedWithQRXmlDE ?? signedXmlDE ?? xmlDE;
        dte.firmado = signedXmlDE != null;
        dte.idestadoEnvioEmail = EstadoEnvioEmail.NO_ENVIADO;
        dte.fechaCambioEstadoEnvioEmaill = new Date();
        dte.intentoEnvioEmail = 0;

        return dte;
    }

    public async regenerarDTE(venta: Venta, detalles: DetalleVenta[]): Promise<DTE> {
        const dte = await this.dteRepo.findOneByOrFail({ id: venta.iddte });
        dte.version = dte.version + 1;
        
        dte.idestadoDocumentoSifen = EstadoDocumentoSifen.NO_ENVIADO;
        dte.fechaCambioEstado = new Date();
        
        const xmlDE = await this.generarDE(venta, detalles);
        const signedXmlDE = await this.dteUtilsSrv.generarDEFirmado(xmlDE);
        const signedWithQRXmlDE = await this.dteUtilsSrv.generarDEConQR(signedXmlDE);

        dte.xml = signedWithQRXmlDE ?? signedXmlDE ?? xmlDE;
        dte.firmado = signedXmlDE != null;
        dte.idestadoEnvioEmail = EstadoEnvioEmail.NO_ENVIADO;
        dte.fechaCambioEstadoEnvioEmaill = new Date();
        dte.intentoEnvioEmail = 0;

        return dte;
    }
      
}
