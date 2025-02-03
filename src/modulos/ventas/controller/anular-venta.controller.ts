import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { Permissions } from '@auth/permission.list';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Headers, Param, UseFilters, UseGuards } from '@nestjs/common';
import { AnularVentaService } from '../service/anular-venta.service';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Controller('ventas')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class AnularVentaController {

    constructor(
        private anularVentaSrv: AnularVentaService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get(':id/anular')
    @AllowedIn(Permissions.VENTAS.ANULAR)
    async anular(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.anularVentaSrv.anular(id, true, this.jwtUtil.extractJwtSub(auth));
    }

    @Get(':id/revertiranulacion')
    @AllowedIn(Permissions.VENTAS.REVERTIRANUL)
    async revertiranul(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.anularVentaSrv.anular(id, false, this.jwtUtil.extractJwtSub(auth));
    }
}
