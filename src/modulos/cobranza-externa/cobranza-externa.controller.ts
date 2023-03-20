import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CobranzaExternaService } from './cobranza-externa.service';
import { AnulacionRequestDTO } from './dto/anulacion-request.dto';
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
    consultar(
        @Body() consultaReq: ConsultaRequestDTO
    ): Promise<GenericoResponseDTO | ConsultaResponseDTO>{
        return this.cobranzaExternaSrv.consultar(consultaReq);
    }

    @Post('pago')
    pagar(
        @Body() pagoReq: PagoRequestDTO
    ): Promise<GenericoResponseDTO>{
        return this.cobranzaExternaSrv.pagar(pagoReq);
    }

    @Post('anulacion')
    anular(
        @Body() anulacionReq: AnulacionRequestDTO
    ): Promise<GenericoResponseDTO>{
        return this.cobranzaExternaSrv.anular(anulacionReq);
    }

}
