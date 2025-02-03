import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { CountTimbradosService } from '../services/count-timbrados.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { QueriesType } from '../types/queries-type';

@Controller('timbrados')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class CountTimbradosController {

    constructor(
        private service: CountTimbradosService
    ){}

    @Get('total')
    @AllowedIn(Permissions.TIMBRADOS.CONSULTAR)
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.service.count(queries);
    }

}
