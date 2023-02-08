import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { CobroDetalleVentaView } from '@database/view/cobro-detalle-venta.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { CobrosService } from './cobros.service';

@Controller('cobros')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class CobrosController {

    constructor(
        private cobrosSrv: CobrosService
    ){}

    @Get('detalles')
    @RequirePermission(Permissions.VENTAS.CONSULTARCOBROS)
    findAllDetalles(
        @Query() queries: {[name: string]: any}
    ): Promise<CobroDetalleVentaView[]>{
        return this.cobrosSrv.findAllDetalles(queries);
    }

    @Get('detalles/total')
    @RequirePermission(Permissions.VENTAS.CONSULTARCOBROS)
    countDetalles(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.cobrosSrv.countDetalles(queries);
    }


}
