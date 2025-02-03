import { Controller, Get, Param, UseFilters, UseGuards } from '@nestjs/common';
import { FindDetallesByNotaCreditoService } from '../services/find-detalles-by-nota-credito.service';
import { NotaCreditoDetalleView } from '@database/view/facturacion/nota-credito-detalle.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('notascredito')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class FindDetallesByNotaCreditoController {

    constructor(
        private findDetallesByNotaCreditoSrv: FindDetallesByNotaCreditoService
    ){}

    @Get(':idnotacredito/detalles')
    @AllowedIn(Permissions.NOTASCREDITO.CONSULTAR)
    getDetalles(
        @Param('idnotacredito') idnotacredito: number
    ): Promise<NotaCreditoDetalleView[]>{
        return this.findDetallesByNotaCreditoSrv.findDetallesByNotaCredito(idnotacredito);
    }
}
