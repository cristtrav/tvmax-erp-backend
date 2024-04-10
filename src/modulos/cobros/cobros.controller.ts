import { Permissions } from '@auth/permission.list';
import { CobroDetalleVentaView } from '@database/view/cobro-detalle-venta.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { CobrosService } from './cobros.service';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('cobros')
@UseGuards(LoginGuard)
@UseFilters(HttpExceptionFilter)
export class CobrosController {

    constructor(
        private cobrosSrv: CobrosService
    ){}

    @Get('detalles')
    findAllDetalles(
        @Query() queries: {[name: string]: any}
    ): Promise<CobroDetalleVentaView[]>{
        return this.cobrosSrv.findAllDetalles(queries);
    }

    @Get('detalles/total')
    countDetalles(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.cobrosSrv.countDetalles(queries);
    }

}
