import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { Controller, Get, Header, Param, StreamableFile, UseFilters, UseGuards } from '@nestjs/common';
import { FindKudeByNotacreditoService } from '../services/find-kude-by-notacredito.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';

@Controller('notascredito')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class FindKudeByNotacreditoController {

    constructor(
        private findKudeByNotaSrv: FindKudeByNotacreditoService
    ){}

    @Get(':id/kude')
    @AllowedIn(Permissions.NOTASCREDITO.CONSULTAR)
    @Header('content-type', 'application/pdf')
    async getKUDEById(
        @Param('id') id: number
    ): Promise<StreamableFile> {
        return this.findKudeByNotaSrv.findKudeByNotaCredito(id);
    }
}
