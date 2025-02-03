import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Headers, Param, UseFilters, UseGuards } from '@nestjs/common';
import { CancelarVentaService } from '../service/cancelar-venta.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Controller('ventas')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class CancelarVentaController {

    constructor(
        private jwtUtils: JwtUtilsService,
        private cancelarVentaSrv: CancelarVentaService
    ){}

    @Get(':id/cancelar')
    @AllowedIn(Permissions.VENTAS.ANULAR)
    async cancelar(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.cancelarVentaSrv.cancelar(
            id,
            this.jwtUtils.extractJwtSub(auth)
        );
    }


}
