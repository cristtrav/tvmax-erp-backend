import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { Injectable } from '@nestjs/common';
import setApi from 'facturacionelectronicapy-setapi';
import { EntityManager } from 'typeorm';

@Injectable()
export class SifenUtilsService {

    constructor(){}

    public async enviar(factElectronica: FacturaElectronica, manager: EntityManager){
        if(!factElectronica){
            console.log(factElectronica.idventa, `No se encuentra la factura electrónica`);
            return;
        }
        if(!factElectronica.firmado){
            console.log(factElectronica.idventa, 'No se envia a SIFEN, documento sin firma');
            factElectronica.observacion = `${factElectronica.idventa} - No se envia a SIFEN, documento sin firma`;
            if(manager) await manager.save(factElectronica);
            return;
        }
        const certPath = process.env.SIFEN_CERT_FOLDER;
        const certFileName = process.env.SIFEN_CERT_FILENAME;
        const certPassword = process.env.SIFEN_CERT_PASSWORD ?? '';
        if(!certPath || !certFileName){
            console.log(factElectronica.idventa, 'No se envia a SIFEN, no se encuentra el certificado digital');
            factElectronica.observacion = `${factElectronica.idventa} - No se envia a SIFEN, no se encuentra el certificado digital`;
            if(manager) await manager.save(factElectronica);
        }
        const sifenEnv: 'test' | 'prod' = <'test' | 'prod'> process.env.SIFEN_AMBIENTE ?? 'test';
        const certFullPath = `${certPath}/${certFileName}`;
        
        const respuesta = await setApi.recibe(
            Number(`${factElectronica.idventa}${factElectronica.version}`),
            factElectronica.documentoElectronico,
            sifenEnv,
            certFullPath,
            certPassword
        );
        console.log("RESPUESTA SIFEN >>>");
        console.log(respuesta);
        factElectronica.fechaCambioEstado = new Date();
        factElectronica.idestadoDocumentoSifen = EstadoDocumentoSifen.APROBADO;
        await manager.save(factElectronica);
    }

}
