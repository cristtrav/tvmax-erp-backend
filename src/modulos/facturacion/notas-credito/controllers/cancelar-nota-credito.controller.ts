import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { Permissions } from '@auth/permission.list';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Controller, Headers, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import { CancelarNotaCreditoService } from '../services/cancelar-nota-credito.service';

@Controller('notascredito')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class CancelarNotaCreditoController {

    constructor(
        private jwtUtilsSrv: JwtUtilsService,
        private cancelarNotaCreditoSrv: CancelarNotaCreditoService
    ){}

    @Post(':id/cancelar')
    @AllowedIn(Permissions.NOTASCREDITO.ANULAR)
    async anularNotaCredito(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.cancelarNotaCreditoSrv.cancelarNotaCredito(
            id,
            this.jwtUtilsSrv.extractJwtSub(auth)
        );
    }

}
