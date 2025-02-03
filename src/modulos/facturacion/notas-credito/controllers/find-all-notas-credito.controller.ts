import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { FindAllNotasCreditoService } from '../services/find-all-notas-credito.service';
import { NotaCreditoView } from '@database/view/facturacion/nota-credito.view';
import { QueriesType } from '../types/queries-type';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';

@Controller('notascredito')
@UseFilters(HttpExceptionFilter)
export class FindAllNotasCreditoController {

    constructor(
        private findAllService: FindAllNotasCreditoService
    ){}

    @Get()
    get(@Query() queries: QueriesType): Promise<NotaCreditoView[]>{
        return this.findAllService.findAll(queries);
    }

}
