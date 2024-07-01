import { Controller, Get, Header, Query, StreamableFile, UseFilters, UseGuards } from '@nestjs/common';
import { TributacionService } from './tributacion.service';
import { QueriesInterface } from './interfaces/queries.interface';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('tributacion')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class TributacionController {

    constructor(
        private tributaionSrv: TributacionService
    ){}

    @Get('ventas/totalarchivos')
    @AllowedIn(Permissions.TRIBUTACION.ACCESOMODULO)
    countFiles(
        @Query() queries: QueriesInterface
    ): Promise<number>{
        return this.tributaionSrv.countFiles(queries);
    }

    @Get('ventas/archivo')
    @AllowedIn(Permissions.TRIBUTACION.ACCESOMODULO)
    @Header('content-type', 'text/csv')
    getFile(
        @Query() queries: QueriesInterface
    ): Promise<StreamableFile> {
        return this.tributaionSrv.generateFile(queries);
    }

}
