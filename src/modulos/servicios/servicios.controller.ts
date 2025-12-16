import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { Permissions } from '../../global/auth/permission.list';
import { ServicioView } from '@database/view/servicio.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { ServicioDTO } from 'src/global/dto/servicio.dto';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('servicios')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class ServiciosController {

    constructor(
        private serviciosSrv: ServiciosService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @AllowedIn(
        Permissions.SERVICIOS.CONSULTAR,
        Permissions.CUOTAS.ACCESOFORMULARIO,
        Permissions.SUSCRIPCIONES.ACCESOFORMULARIO,
        Permissions.PAGOSCLIENTES.ACCESOMODULO,
        Permissions.POS.ACCESOMODULO,
        Permissions.POSMOVIL.ACCESOMODULO,
        Permissions.VENTAS.ACCESOMODULO
    )
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<ServicioView[]> {
        return this.serviciosSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.SERVICIOS.CONSULTAR)
    async count(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.serviciosSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.SERVICIOS.REGISTRAR)
    async create(
        @Body() servicio: ServicioDTO,
        @Headers('authorization') auth: string
    ) {
        await this.serviciosSrv.create(
            DTOEntityUtis.servicioDtoToEntity(servicio),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @AllowedIn(Permissions.SERVICIOS.EDITAR)
    async update(
        @Param('id') oldid: number,
        @Body() s: ServicioDTO,
        @Headers('authorization') auth: string
    ) {
        await this.serviciosSrv.update(
            oldid,
            DTOEntityUtis.servicioDtoToEntity(s),
            this.jwtUtils.extractJwtSub(auth)
        )
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.SERVICIOS.CONSULTARULTIMOID)
    async getLastId(): Promise<number> {
        return this.serviciosSrv.getLastId();
    }

    @Get(':id')
    @AllowedIn(
        Permissions.SERVICIOS.CONSULTAR,
        Permissions.CUOTAS.ACCESOFORMULARIO
    )
    async findById(
        @Param('id') id: number,
    ): Promise<ServicioView> {
        return this.serviciosSrv.findById(id);
    }

    @Delete(':id')
    @AllowedIn(Permissions.SERVICIOS.ELIMINAR)
    async delete(
        @Param('id') id: number,        
        @Headers('authorization') auth: string
    ) {
        await this.serviciosSrv.delete(
            id,
            this.jwtUtils.extractJwtSub(auth)
        );
    }

}
