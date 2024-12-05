import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import setApi from 'facturacionelectronicapy-setapi';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CancelacionFactura } from '@database/entity/facturacion/cancelacion-factura.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SifenUtilService } from './sifen-util.service';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { SifenLoteMessageService } from '@modulos/sifen/lote-sifen/services/sifen-lote-message.service';
import { ResultadoProcesamientoLoteType } from '@modulos/sifen/lote-sifen/types/resultado-procesamiento-lote.type';

@Injectable()
export class SifenApiUtilService {

    constructor(
        private sifenUtilSrv: SifenUtilService,
        private sifenLoteMessageSrv: SifenLoteMessageService,
        @InjectRepository(FacturaElectronica)
        private facturaElectronicaRepo: Repository<FacturaElectronica>,
        @InjectRepository(EstadoDocumentoSifen)
        private estadoDocumentoSifenRepo: Repository<EstadoDocumentoSifen>,
        @InjectRepository(Lote)
        private loteRepo: Repository<Lote>,
        private datasource: DataSource
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

    public async enviarLote(lote: Lote){
        console.log(`Envio de Lote ${lote.id} a SIFEN`);
        const response = await setApi.recibeLote(
            lote.id,
            lote.facturas.map(f => f.documentoElectronico),
            this.sifenUtilSrv.getAmbiente(),
            this.sifenUtilSrv.getCertData().certFullPath,
            this.sifenUtilSrv.getCertData().certPassword
        );
        console.log(response);
        const oldLote = { ...lote };
        lote.fechaHoraEnvio = new Date();
        lote.enviado = true;
        lote.aceptado = this.sifenLoteMessageSrv.isLoteAceptadoEnvio(response);
        lote.nroLoteSifen = this.sifenLoteMessageSrv.getNroLoteSifenEnvio(response);
        lote.observacion = this.sifenLoteMessageSrv.getResumenEnvio(response);
        await this.datasource.transaction(async manager => {
            await manager.save(lote);
            await manager.save(Lote.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldLote, lote));
        })
    }

    public async consultarLote(lote: Lote): Promise<ResultadoProcesamientoLoteType>{
        if(lote.nroLoteSifen == null){
            console.log(`id:${lote.id} - Sin Nro. de lote de SIFEN, no se consulta`);
            return;
        }
        if(Number.isNaN(Number(lote.nroLoteSifen))){
            console.log(`id:${lote.id} - Nro. de lote no es un valor numérico, no se consulta`);
            return;
        }
        const response = await setApi.consultaLote(
            lote.id,
            Number(lote.nroLoteSifen),
            this.sifenUtilSrv.getAmbiente(),
            this.sifenUtilSrv.getCertData().certFullPath,
            this.sifenUtilSrv.getCertData().certPassword
        );
        console.log("Respuesta de consulta de lote SIFEN");
        console.log(response);
        console.log(response['ns2:rResEnviConsLoteDe']['ns2:gResProcLote']);
        return this.sifenLoteMessageSrv.buildResultadoProcesamientoLote(response);
    }

}