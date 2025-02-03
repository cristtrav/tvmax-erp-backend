import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { Permissions } from '@auth/permission.list';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Headers, Param, UseFilters, UseGuards } from '@nestjs/common';
import { AnularVentaNotacreditoService } from '../service/anular-venta-notacredito.service';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Controller('ventas')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class AnularVentaNotacreditoController {

    constructor(
        private anularNCSrv: AnularVentaNotacreditoService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get(':id/anular-nc')
    @AllowedIn(Permissions.VENTAS.ANULAR)
    async anularNC(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.anularNCSrv.anularNC(id, this.jwtUtils.extractJwtSub(auth));
    }
}
