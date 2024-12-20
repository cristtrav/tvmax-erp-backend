import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { TimbradoView } from '@database/view/timbrado.view';
import { VentaView } from '@database/view/venta.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SifenUtilService } from './sifen-util.service';
import xmlgen from 'facturacionelectronicapy-xmlgen';
import xmlsign from 'facturacionelectronicapy-xmlsign';
import { FacturaElectronicaUtilsService } from './factura-electronica-utils.service';

@Injectable()
export class SifenEventosUtilService {

    constructor(
        private sifenUtilSrv: SifenUtilService,
        private sifenFacturaUtilSrv: FacturaElectronicaUtilsService,
        @InjectRepository(VentaView)
        private ventaViewRepo: Repository<VentaView>,
        @InjectRepository(TimbradoView)
        private timbradoViewRepo: Repository<TimbradoView>,
    ){}

    public async getCancelacion(idevento: number, factura: FacturaElectronica): Promise<string>{
        const data = {
            cdc: this.sifenUtilSrv.getCDC(factura),
            motivo: 'Cancelación de CDC'
        }
        console.log("Anulacion DATA", data);
        const venta = await this.ventaViewRepo.findOneByOrFail({ id: factura.idventa });
        const timbrado = await this.timbradoViewRepo.findOneByOrFail({ id: venta.idtimbrado });
        const documentoXML = await xmlgen.generateXMLEventoCancelacion(idevento, await this.sifenFacturaUtilSrv.getParams(timbrado), data);
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
