import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { RequirePermission } from '../../global/auth/require-permission.decorator';
import { Permissions } from '../../global/auth/permission.list';
import { ServicioView } from '@database/view/servicio.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@database/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { AuthGuard } from '@auth/auth.guard';
import { ServicioDTO } from '@dto/servicio.dto';

@Controller('servicios')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class ServiciosController {

    constructor(
        private serviciosSrv: ServiciosService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<ServicioView[]> {
        return this.serviciosSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    async count(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.serviciosSrv.count(queries);
    }

    @Post()
    @RequirePermission(Permissions.SERVICIOS.REGISTRAR)
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
    @RequirePermission(Permissions.SERVICIOS.EDITAR)
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
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    async getLastId(): Promise<number> {
        return this.serviciosSrv.getLastId();
    }

    @Get(':id')
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    async findById(
        @Param('id') id: number,
    ): Promise<ServicioView> {
        return this.serviciosSrv.findById(id);
    }

    @Delete(':id')
    @RequirePermission(Permissions.SERVICIOS.ELIMINAR)
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
