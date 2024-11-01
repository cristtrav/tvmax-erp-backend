import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { Injectable } from '@nestjs/common';
import setApi from 'facturacionelectronicapy-setapi';
import { EntityManager, Repository } from 'typeorm';
import { CancelacionFactura } from '@database/entity/facturacion/cancelacion-factura.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SifenUtilsService {

    constructor(
        @InjectRepository(FacturaElectronica)
        private facturaElectronicaRepo: Repository<FacturaElectronica>,
        @InjectRepository(EstadoDocumentoSifen)
        private estadoDocumentoSifenRepo: Repository<EstadoDocumentoSifen>
    ){}

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

    public async enviarCancelacion(cancelacion: CancelacionFactura, entityManager: EntityManager){
        const factElect = await this.facturaElectronicaRepo.findOneBy({ idventa: cancelacion.idventa });

        if(factElect.idestadoDocumentoSifen != EstadoDocumentoSifen.APROBADO && factElect.idestadoDocumentoSifen != EstadoDocumentoSifen.APROBADO_CON_OBS){
            const estadoDoc = await this.estadoDocumentoSifenRepo.findOneBy({ id: factElect.idestadoDocumentoSifen });
            cancelacion.observacion = `El estado de la factura electrónica es ${estadoDoc.id} - ${estadoDoc.descripcion}. No se envía a SIFEN`;
            await entityManager.save(cancelacion);
            return;
        }
        
        if(!this.certDataExists()){
            cancelacion.observacion = `No se encuentra el certificado digital. No se envía a SIFEN`;
            await entityManager.save(cancelacion);
            return;
        }
        
        const certData = this.getCertData();
        cancelacion.fechaHoraEnvio = new Date();
        const response = await setApi.evento(Number(cancelacion.id), cancelacion.documento, this.getSifenEnv(), certData.certFullPath, certData.certPassword);
        cancelacion.envioCorrecto = false;
        cancelacion.observacion = response;
        await entityManager.save(cancelacion);
    }

    private getSifenEnv(): 'test' | 'prod' {
        return <'test' | 'prod'> process.env.SIFEN_AMBIENTE ?? 'test';
    }

    private certDataExists(): boolean {
        const certData = this.getCertData();
        return certData.certPath != null && certData.certFileName != null &&  certData.certPassword != null;
    }

    private getCertData(): CertDataType {
        const certData: CertDataType = {
            certPath: process.env.SIFEN_CERT_FOLDER,
            certFileName: process.env.SIFEN_CERT_FILENAME,
            certPassword: process.env.SIFEN_CERT_PASSWORD ?? ''
        }
        if(certData.certPath && certData.certFileName) certData.certFullPath = `${certData.certPath}/${certData.certFileName}`
        return certData;
    }

}

type CertDataType = { certPath?: string, certFileName?: string, certPassword?: string, certFullPath?: string; }