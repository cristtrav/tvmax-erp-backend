import { LoteSifenService } from '@modulos/sifen/lote-sifen/services/lote-sifen.service';
import { SifenApiUtilService } from '@modulos/ventas/service/sifen-api-util.service';
import { SifenUtilService } from '@modulos/ventas/service/sifen-util.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SifenTaskService {

    constructor(
        private loteSifenSrv: LoteSifenService,
        private sifenApiUtilsSrv: SifenApiUtilService,
        private sifenUtilSrv: SifenUtilService
    ){}

    @Cron('0 22,0,3 * * *')
    async generarEnviarLote(){
        if(this.sifenUtilSrv.isEnvioLoteAutoDisabled() || this.sifenUtilSrv.isDisabled()){
            console.log(`Generacion y envio automático de lote desactivado.`);
            return;
        }

        console.log('Generar lotes y enviar a sifen...');
        const loteGen = await this.loteSifenSrv.generarLotes();
        console.log(`Se generó ${loteGen.length} lotes.`);
        const lotes = await this.loteSifenSrv.findAll({enviado: false});
        console.log(`Se van a enviar ${lotes.length} lotes.`);
        lotes.forEach(async lote => {
            console.log(`Enviando lote ${lote.id}...`);
            await this.sifenApiUtilsSrv.enviarLote(lote);
        });
    }

    @Cron('0 6,12,18 * * *')
    async consultarLotes(){
        if(this.sifenUtilSrv.isEnvioLoteAutoDisabled() || this.sifenUtilSrv.isDisabled()){
            console.log(`Consulta automátoca de lote desactivada.`);
            return;
        }

        console.log('Consultar lotes de facturas...');
        const lotes = await this.loteSifenSrv.findAll({enviado: true, consultado: false})
        lotes.forEach(async lote => {
            console.log(`Consultar lote ${lote.id}...`);
            const response = await this.sifenApiUtilsSrv.consultarLote(lote);
            console.log(`Estado lote: ${response.codigo} - ${response.mensaje}`);
            if(response.codigo == '0362') await this.loteSifenSrv.actualizarDatosConsulta(response);
        })
        
    }
}
