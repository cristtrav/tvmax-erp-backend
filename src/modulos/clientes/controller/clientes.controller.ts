import { ClienteDTO } from 'src/global/dto/cliente.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { ClientesService } from '../service/clientes.service';
import { SuscripcionesService } from '../../suscripciones/suscripciones.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { ClienteView } from '@database/view/cliente.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { Cliente } from '@database/entity/cliente.entity';

@Controller('clientes')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class ClientesController {

    constructor(
        private clientesSrv: ClientesService,
        private suscripcionesSrv: SuscripcionesService,
        private jwtUtil: JwtUtilsService
    ) { }

    @Get()
    @AllowedIn(
        Permissions.CLIENTES.CONSULTAR,
        Permissions.DOMICILIOS.ACCESOFORMULARIO,
        Permissions.SUSCRIPCIONES.ACCESOFORMULARIO,
        Permissions.POS.ACCESOMODULO
    )
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<ClienteView[]> {
        return this.clientesSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.CLIENTES.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.clientesSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.CLIENTES.REGISTRAR)
    async create(
        @Body() c: ClienteDTO,
        @Headers('authorization') auth: string
    ) {
        await this.clientesSrv.create(
            new Cliente().fromDTO(c),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.CLIENTES.ACCESOFORMULARIO)
    getLastId(): Promise<number> {
        return this.clientesSrv.getLastId();
    }

    @Get(':id')
    @AllowedIn(
        Permissions.CLIENTES.ACCESOFORMULARIO,
        Permissions.POS.ACCESOMODULO,
        Permissions.SORTEOS.REALIZARSORTEO
    )
    findById(
        @Param('id') id: number
    ): Promise<ClienteView> {
        return this.clientesSrv.findById(id);       
    }

    @Put(':id')
    @AllowedIn(Permissions.CLIENTES.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() c: ClienteDTO,
        @Headers('authorization') auth: string
    ) {
        await this.clientesSrv.edit(
            oldId,
            new Cliente().fromDTO(c),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @AllowedIn(Permissions.CLIENTES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.clientesSrv.delete(id, this.jwtUtil.extractJwtSub(auth))
    }

    @Get(':id/suscripciones')
    @AllowedIn(
        Permissions.PAGOSCLIENTES.ACCESOMODULO,
        Permissions.POS.ACCESOMODULO
    )
    findSuscripcionesPorCliente(
        @Param('id') idcliente: number,
        @Query() queries: {[name: string]: any}
    ): Promise<SuscripcionView[]> {        
        return this.suscripcionesSrv.findAll({...queries, idcliente});
    }

    @Get(':id/suscripciones/total')
    countSuscripcionesPorCliente(
        @Param('id') idcliente: number,
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.suscripcionesSrv.count({...queries, idcliente});
    }

    @Put(':id/contacto')
    @AllowedIn(Permissions.CLIENTES.ACTUALIZARCONTACTO)
    async editContacto(
        @Param('id') id: number,
        @Body() contacto: { telefono1: string, telefono2: string, email: string },
        @Headers('authorization') auth: string
    ){
        await this.clientesSrv.editContacto(id, contacto, this.jwtUtil.extractJwtSub(auth));
    }

}
