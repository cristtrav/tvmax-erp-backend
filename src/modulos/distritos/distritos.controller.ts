import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Headers, UseFilters } from '@nestjs/common';
import { DistritoDTO } from '../../global/dto/distrito.dto';
import { Permissions } from '../../global/auth/permission.list';
import { DistritosService } from './distritos.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DistritoView } from '@database/view/distritos.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('distritos')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class DistritosController {

    constructor(
        private distritosSrv: DistritosService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @AllowedIn(
        Permissions.DISTRITOS.CONSULTAR,
        Permissions.BARRIOS.ACCESOMODULO,
        Permissions.BARRIOS.ACCESOFORMULARIO,
        Permissions.CLIENTES.ACCESOMODULO,
        Permissions.SUSCRIPCIONES.ACCESOMODULO
    )
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<DistritoView[]> {
        return this.distritosSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.DISTRITOS.CONSULTAR)
    async count(
        @Query() queries: {[name: string]: any }
    ): Promise<number> {
        return this.distritosSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.DISTRITOS.REGISTRAR)
    async create(
        @Body() d: DistritoDTO,
        @Headers('authorization') auth: string
    ) {
        await this.distritosSrv.create(
            DTOEntityUtis.distritoDtoToEntity(d),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Get(':id')
    @AllowedIn(Permissions.DISTRITOS.ACCESOMODULO)
    async findById(
        @Param('id') id: string
    ): Promise<DistritoView> {
        return this.distritosSrv.findById(id);
    }

    @Put(':id')
    @AllowedIn(Permissions.DISTRITOS.EDITAR)
    async edit(
        @Param('id') oldId: string,
        @Body() d: DistritoDTO,
        @Headers('authorization') auth: string
    ) {
        await this.distritosSrv.edit(
            oldId,
            DTOEntityUtis.distritoDtoToEntity(d),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @AllowedIn(Permissions.DISTRITOS.ELIMINAR)
    async delete(
        @Param('id') id: string,
        @Headers('authorization') auth: string
    ) {
        await this.distritosSrv.delete(
            id,
            this.jwtUtils.extractJwtSub(auth)
        );
    }
}
