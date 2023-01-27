import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { ClienteDTO } from '@dto/cliente.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';
import { Suscripcion } from '@dto/suscripcion.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { ClienteView } from '@database/view/cliente.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@database/dto-entity-utils';

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
    @RequirePermission(Permissions.CLIENTES.CONSULTAR)
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

    //PENDIENTE DE CONVERTIR A TYPEORM
    @Get(':id/suscripciones')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    async findSuscripcionesPorCliente(
        @Param('id') idcliente: number,
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<Suscripcion>> {
        try {
            const rows: Suscripcion[] = await this.suscripcionesSrv.findSuscripcionesPorCliente(idcliente, { eliminado, sort, offset, limit });
            const count: number = await this.suscripcionesSrv.countSuscripcionesPorCliente(idcliente, {eliminado});
            return new ServerResponseList<Suscripcion>(rows, count);
        } catch (e) {
            console.log('Error al consultar suscripciones por cliente');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}
