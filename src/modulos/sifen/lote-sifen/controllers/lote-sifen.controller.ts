import { LoteSifenService } from '@modulos/sifen/lote-sifen/services/lote-sifen.service';
import { SifenApiUtilService } from '@modulos/ventas/service/sifen-api-util.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('sifen')
export class LoteSifenController {

    constructor(
        private loteSifenSrv: LoteSifenService,
        private sifenApiUtilsSrv: SifenApiUtilService
    ){}

    @Get('generar')
    async generar(){
        /*const lotes = await this.loteSifenSrv.generarLotes();
        return `${lotes.length} Lotes generados`;*/
    }

    @Get('enviar')
    async enviarPendientes(){
        /*const lotes = await this.loteSifenSrv.findAll({enviado: false});
        console.log(`${lotes.length} lotes sin enviar`);
        if(lotes.length > 0){
            const response = await this.sifenApiUtilsSrv.enviarLote(lotes[0]);
            console.log(response);
        }
        return 'Enviar lotes pendientes';*/
    }

    @Get('enviar/:id')
    async enviarPorId(
        @Param('id') id: number
    ){
        /*const lote = await this.loteSifenSrv.findById(id);
        await this.sifenApiUtilsSrv.enviarLote(lote);
        return `lote id ${id} enviado`;*/
    }

    @Get(':id')
    async consulta(
        @Param('id') id: number
    ){
        /*const lote = await this.loteSifenSrv.findById(id);
        const respuesta = await this.sifenApiUtilsSrv.consultarLote(lote);
        await this.loteSifenSrv.actualizarDatosConsulta(respuesta);
        return respuesta;*/
    }
}
