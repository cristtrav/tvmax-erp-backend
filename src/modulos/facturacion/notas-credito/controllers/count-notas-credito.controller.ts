import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { CountNotasCreditoService } from '../services/count-notas-credito.service';
import { QueriesType } from '../types/queries-type';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';

@Controller('notascredito')
@UseFilters(HttpExceptionFilter)
export class CountNotasCreditoController {

    constructor(
        private countService: CountNotasCreditoService
    ){}

    @Get('total')
    count(@Query() queries: QueriesType): Promise<number>{
        return this.countService.count(queries);
    }

}
