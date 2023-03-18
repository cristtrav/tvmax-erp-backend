import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CobranzaExternaService } from './cobranza-externa.service';
import { ConsultaRequestDTO } from './dto/consulta-request.dto';
import { ConsultaResponseDTO } from './dto/consulta-response.dto';
import { GenericoResponseDTO } from './dto/generico-response.dto';
import { PagoRequestDTO } from './dto/pago-request.dto';
import { CobranzaExternaGuard } from './guard/cobranza-externa.guard';

@Controller('cobranzaexterna')
@UseGuards(CobranzaExternaGuard)
export class CobranzaExternaController {

    constructor(
        private cobranzaExternaSrv: CobranzaExternaService
    ){}

    @Post('consulta')
    consulta(
        @Body() consultaReq: ConsultaRequestDTO
    ): Promise<GenericoResponseDTO | ConsultaResponseDTO>{
        return this.cobranzaExternaSrv.consulta(consultaReq);
    }

    @Post('pago')
    pago(
        @Body() pagoReq: PagoRequestDTO
    ): Promise<GenericoResponseDTO>{
        return this.cobranzaExternaSrv.pago(pagoReq);
    }

}
