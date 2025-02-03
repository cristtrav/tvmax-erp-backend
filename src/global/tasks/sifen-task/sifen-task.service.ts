import { LoteDteService } from '@modulos/sifen/sifen-utils/services/lotes/lote-dte.service';
import { SifenApiUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-api-util.service';
import { SifenUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-util.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SifenTaskService {

    constructor(
        private loteSifenSrv: LoteDteService,
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
            await this.sifenApiUtilsSrv.enviarLote(lote.id);
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
