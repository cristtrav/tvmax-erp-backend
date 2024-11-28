import { Injectable } from '@nestjs/common';
import { CertDataType } from '../types/cert-data.type';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { xml2json } from 'xml-js';

@Injectable()
export class SifenUtilService {

    public certDataExists(): boolean {
        const certData = this.getCertData();
        return certData.certPath != null && certData.certFileName != null &&  certData.certPassword != null;
    }

    public getCertData(): CertDataType {
        return {
            certPath: process.env.SIFEN_CERT_FOLDER ?? '',
            certFileName: process.env.SIFEN_CERT_FILENAME ?? '',
            certPassword: process.env.SIFEN_CERT_PASSWORD ?? '',
            certFullPath: `${process.env.SIFEN_CERT_FOLDER}/${process.env.SIFEN_CERT_FILENAME}`
        }
    }

    public getAmbiente(): 'test' | 'prod' {
        return <'test' | 'prod'> process.env.SIFEN_AMBIENTE ?? 'test';
    }

    public getCDC(factura: FacturaElectronica): string {
        const deJson = JSON.parse(xml2json(factura.documentoElectronico));
        return deJson.elements[0].elements[1].attributes.Id;
    }

    /*public getMensajeEvento(response: string): string {

    }*/

    public getEstadoApiEvento(response: string): string {
        //Aprobado, Rechazado, etc...
        return response['ns2:rRetEnviEventoDe']['ns2:gResProcEVe']['ns2:dEstRes'];
    }

    public getCodigoEstadoApiEvento(response: string): string {
        return response['ns2:rRetEnviEventoDe']['ns2:gResProcEVe']['ns2:gResProc']['ns2:dCodRes'];
    }

    public getMensajeEstadoApiEvento(response: string): string {
        return response['ns2:rRetEnviEventoDe']['ns2:gResProcEVe']['ns2:gResProc']['ns2:dMsgRes'];
    }

    public getResumenEstadoApiEvento(response: string): string {
        return `${this.getEstadoApiEvento(response)} - (${this.getCodigoEstadoApiEvento(response)}) ${this.getMensajeEstadoApiEvento(response)}`
    }

    public getEstadoApiDE(response: string): string {
        //Aprobado, Rechazado, etc...
        return response['ns2:rRetEnviDe']['ns2:rProtDe']['ns2:dEstRes'];
    }

    public getCodigoEstadoApiDE(response: string): string {
        return response['ns2:rRetEnviDe']['ns2:rProtDe']['ns2:gResProc']['ns2:dCodRes'];
    }

    public getMensajeEstadoApiDE(response: string): string {
        return response['ns2:rRetEnviDe']['ns2:rProtDe']['ns2:gResProc']['ns2:dMsgRes'];
    }

    public getResumenEstadoApiDE(response: string): string {
        return `${this.getEstadoApiDE(response)} - (${this.getCodigoEstadoApiDE(response)}) ${this.getMensajeEstadoApiDE(response)}`
    }

}
