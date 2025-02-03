import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { FindAllTimbradosService } from '../services/find-all-timbrados.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { QueriesType } from '../types/queries-type';
import { TimbradoView } from '@database/view/facturacion/timbrado.view';

@Controller('timbrados')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class FindAllTimbradosController {

    constructor(
        private service: FindAllTimbradosService
    ){}

    @Get()
    @AllowedIn(Permissions.TIMBRADOS.CONSULTAR)
    get(
        @Query() queries: QueriesType
    ): Promise<TimbradoView[]>{
        return this.service.findAll(queries);
    }

}
