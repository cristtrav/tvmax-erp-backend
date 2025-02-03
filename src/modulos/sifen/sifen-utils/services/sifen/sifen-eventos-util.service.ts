import { DTE } from '@database/entity/facturacion/dte.entity';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { VentaView } from '@database/view/venta.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SifenUtilService } from './sifen-util.service';
import xmlgen from 'facturacionelectronicapy-xmlgen';
import xmlsign from 'facturacionelectronicapy-xmlsign';
import { DteXmlUtilsService } from '../dte/dte-xml-utils.service';
import { DteUtilsService } from '../dte/dte-utils.service';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';

@Injectable()
export class SifenEventosUtilService {

    constructor(
        private dteXmlUtils: DteXmlUtilsService,
        private dteUtilsSrv: DteUtilsService,
        private sifenUtilSrv: SifenUtilService,
        @InjectRepository(VentaView)
        private ventaViewRepo: Repository<VentaView>,
        @InjectRepository(TalonarioView)
        private talonarioViewRepo: Repository<TalonarioView>,
        @InjectRepository(NotaCredito)
        private notaCreditoRepo: Repository<NotaCredito>
    ){}

    public async getCancelacionFactura(idevento: number, factura: DTE): Promise<string>{
        const data = {
            cdc: this.dteXmlUtils.getCDC(factura.xml),
            motivo: 'Cancelación de CDC'
        }
        console.log("Anulacion DATA", data);
        const venta = await this.ventaViewRepo.findOneByOrFail({ iddte: factura.id, eliminado: false });
        const talonario = await this.talonarioViewRepo.findOneByOrFail({ id: venta.idtalonario });
        const documentoXML = await xmlgen.generateXMLEventoCancelacion(idevento, await this.dteUtilsSrv.getParams(talonario), data);
        return documentoXML;
    }

    public async getCancelacionNotaCredito(idevento: number, dte: DTE): Promise<string>{
        const data = {
            cdc: this.dteXmlUtils.getCDC(dte.xml),
            motivo: 'Cancelación de CDC'
        }
        console.log("Anulacion DATA", data);
        const nota = await this.notaCreditoRepo.findOneByOrFail({ iddte: dte.id });
        const talonario = await this.talonarioViewRepo.findOneByOrFail({ id: nota.idtalonario });
        const documentoXML = await xmlgen.generateXMLEventoCancelacion(idevento, await this.dteUtilsSrv.getParams(talonario), data);
        return documentoXML;
    }

    public async getEventoFirmado(xml: string): Promise<string>{
        return await xmlsign.signXMLEvento(
            xml,
            this.sifenUtilSrv.getCertData().certFullPath,
            this.sifenUtilSrv.getCertData().certPassword,
            true
        );
    }

}
