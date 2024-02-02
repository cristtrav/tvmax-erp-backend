import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { ClienteDTO } from 'src/global/dto/cliente.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { ClienteView } from '@database/view/cliente.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { SuscripcionView } from '@database/view/suscripcion.view';

@Controller('clientes')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class ClientesController {

    constructor(
        private clientesSrv: ClientesService,
        private suscripcionesSrv: SuscripcionesService,
        private jwtUtil: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.CLIENTES.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<ClienteView[]> {
        return this.clientesSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.CLIENTES.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.clientesSrv.count(queries);
    }

    @Post()
    @RequirePermission(Permissions.CLIENTES.REGISTRAR)
    async create(
        @Body() c: ClienteDTO,
        @Headers('authorization') auth: string
    ) {
        await this.clientesSrv.create(
            DTOEntityUtis.clienteDtoToEntity(c),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.CLIENTES.CONSULTARULTIMOID)
    getLastId(): Promise<number> {
        return this.clientesSrv.getLastId();
    }

    @Get(':id')
    @RequirePermission(Permissions.CLIENTES.CONSULTAR)
    findById(
        @Param('id') id: number
    ): Promise<ClienteView> {
        return this.clientesSrv.findById(id);       
    }

    @Put(':id')
    @RequirePermission(Permissions.CLIENTES.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() c: ClienteDTO,
        @Headers('authorization') auth: string
    ) {
        await this.clientesSrv.edit(
            oldId,
            DTOEntityUtis.clienteDtoToEntity(c),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @RequirePermission(Permissions.CLIENTES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.clientesSrv.delete(id, this.jwtUtil.extractJwtSub(auth))
    }

    @Get(':id/suscripciones')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    findSuscripcionesPorCliente(
        @Param('id') idcliente: number,
        @Query() queries: {[name: string]: any}
    ): Promise<SuscripcionView[]> {        
        return this.suscripcionesSrv.findAll({...queries, idcliente});
    }

    @Get(':id/suscripciones/total')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    countSuscripcionesPorCliente(
        @Param('id') idcliente: number,
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.suscripcionesSrv.count({...queries, idcliente});
    }

}
