import { LoginGuard } from '@auth/guards/login.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ParametrosGeneracionDTO } from './parametros-generacion.dto';
import { GenerarDteLotesService } from './generar-dte-lotes.service';

@Controller('generar-dte-lotes')
@UseGuards(LoginGuard)
export class GenerarDteLotesController {

    constructor(
        private generarDteLotesSrv: GenerarDteLotesService
    ){}

    @Post()
    async post(
        @Body() params: ParametrosGeneracionDTO
    ): Promise<number>{
        console.log(params)
        return await this.generarDteLotesSrv.generarDte(params);
    }

}
