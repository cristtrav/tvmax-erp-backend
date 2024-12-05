import { Controller, Get, HttpException, HttpStatus, Param, UseFilters, UseGuards } from '@nestjs/common';
import { ConsultaRucService } from '../services/consulta-ruc.service';
import { DetalleConsultaRucType } from '../types/detalle-ruc.type';
import { ConsultaRucMessageService } from '../services/consulta-ruc-message.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('sifen/consultaruc')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class ConsultaRucController {

    constructor(
        private consultaRucSrv: ConsultaRucService
    ){}

    @Get(':ci')
    @AllowedIn(Permissions.CLIENTES.CONSULTAR)
    async consultaRuc(
        @Param('ci') ci: string
    ): Promise<DetalleConsultaRucType>{
        const response = await this.consultaRucSrv.consultar(ci);
        if(response.codigo == ConsultaRucMessageService.COD_NO_AUTORIZADO)
            throw new HttpException({
                message: `${response.codigo} - ${response.mensaje}`
            }, HttpStatus.FORBIDDEN);

        if(response.codigo == ConsultaRucMessageService.COD_NO_ENCOTRADO)
            throw new HttpException({
                message: `${response.codigo} - ${response.mensaje}`
            }, HttpStatus.NOT_FOUND)
        return response.detalleRuc;
    }

}
