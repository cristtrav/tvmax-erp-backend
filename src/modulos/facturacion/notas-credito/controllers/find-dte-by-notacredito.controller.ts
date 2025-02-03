import { DteView } from '@database/view/facturacion/dte.view';
import { Controller, Get, Param, UseFilters, UseGuards } from '@nestjs/common';
import { FindDteByNotacreditoService } from '../services/find-dte-by-notacredito.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('notascredito')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class FindDteByNotacreditoController {

    constructor(
        private findDteByNotaSrv: FindDteByNotacreditoService
    ){}

    @Get(':id/dte')
    @AllowedIn(Permissions.NOTASCREDITO.CONSULTAR)
    async findDteByNota(
        @Param('id') id: number
    ): Promise<DteView>{
        return this.findDteByNotaSrv.findDteByNotaCredito(id);
    }
    
}
