import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ClientesTipoService } from '../service/clientes-tipo.service';
import { ClienteTipo } from '@database/entity/cliente-tipo.entity';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('tiposclientes')
@UseGuards(LoginGuard)
@UseFilters(HttpExceptionFilter)
export class ClientesTipoController {

    constructor(
        private clientesTipoSrv: ClientesTipoService
    ){}

    @Get()
    @AllowedIn(Permissions.CLIENTES.ACCESOFORMULARIO)
    findAll(
        @Query() queries: QueriesType
    ): Promise<ClienteTipo[]>{
        return this.clientesTipoSrv.findAll(queries);
    }

}

type QueriesType = {[name: string]: any}
