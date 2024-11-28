import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import setApi from 'facturacionelectronicapy-setapi';
import { EntityManager, Repository } from 'typeorm';
import { CancelacionFactura } from '@database/entity/facturacion/cancelacion-factura.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SifenUtilService } from './sifen-util.service';

@Injectable()
export class SifenApiUtilService {

    constructor(
        private sifenUtilSrv: SifenUtilService,
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

        if(!this.sifenUtilSrv.certDataExists()){
            console.log(factElectronica.idventa, 'No se envia a SIFEN, no se encuentra el certificado digital');
            factElectronica.observacion = `${factElectronica.idventa} - No se envia a SIFEN, no se encuentra el certificado digital`;
            if(manager) await manager.save(factElectronica);
        }
        
        const response = await setApi.recibe(
            Number(`${factElectronica.idventa}${factElectronica.version}`),
            factElectronica.documentoElectronico,
            this.sifenUtilSrv.getAmbiente(),
            this.sifenUtilSrv.getCertData().certFullPath,
            this.sifenUtilSrv.getCertData().certPassword
        );
        const estado = this.sifenUtilSrv.getEstadoApiDE(response);

        if(estado == 'Rechazado') throw new HttpException({
            message: this.sifenUtilSrv.getResumenEstadoApiDE(response)
        }, HttpStatus.INTERNAL_SERVER_ERROR);

        factElectronica.fechaCambioEstado = new Date();
        factElectronica.observacion = this.sifenUtilSrv.getResumenEstadoApiDE(response);
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
        
        if(!this.sifenUtilSrv.certDataExists()){
            cancelacion.observacion = `No se encuentra el certificado digital. No se envía a SIFEN`;
            await entityManager.save(cancelacion);
            return;
        }
    
        cancelacion.fechaHoraEnvio = new Date();
        const response = await setApi.evento(
            Number(cancelacion.id),
            cancelacion.documento, 
            this.sifenUtilSrv.getAmbiente(),
            this.sifenUtilSrv.getCertData().certFullPath,
            this.sifenUtilSrv.getCertData().certPassword
        );
        
        const estado = this.sifenUtilSrv.getEstadoApiEvento(response);
        if(estado == 'Rechazado') throw new HttpException({
            message: this.sifenUtilSrv.getResumenEstadoApiEvento(response)
        }, HttpStatus.INTERNAL_SERVER_ERROR);

        cancelacion.envioCorrecto = true;
        cancelacion.observacion = this.sifenUtilSrv.getResumenEstadoApiEvento(response);
        await entityManager.save(cancelacion);
    }

}