import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CobranzaExternaService } from './cobranza-externa.service';
import { ConsultaRequestDTO } from './dto/consulta-request.dto';
import { ConsultaResponseDTO } from './dto/consulta-response.dto';
import { GenericoResponseDTO } from './dto/generico-response.dto';
import { CobranzaExternaGuard } from './guard/cobranza-externa.guard';

@Controller('cobranzaexterna')
@UseGuards(CobranzaExternaGuard)
export class CobranzaExternaController {

    constructor(
        private cobranzaExternaSrv: CobranzaExternaService
    ){}

    @Post('consulta')
    consulta(
        @Body() consulta: ConsultaRequestDTO
    ): Promise<GenericoResponseDTO | ConsultaResponseDTO>{
        return this.cobranzaExternaSrv.consulta(consulta);
    }

}
