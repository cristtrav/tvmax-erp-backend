import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, Headers, UseFilters } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { Grupo } from '@database/entity/grupo.entity';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { GrupoDTO } from '@dto/grupo.dto';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('grupos')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class GruposController {

    constructor(
        private gruposSrv: GruposService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @AllowedIn(
        Permissions.GRUPOS.CONSULTAR,
        Permissions.SERVICIOS.ACCESOMODULO,
        Permissions.SUSCRIPCIONES.ACCESOMODULO,
        Permissions.PAGOSCLIENTES.ACCESOMODULO,
        Permissions.VENTAS.ACCESOMODULO
    )
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<Grupo[]> {
        return this.gruposSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.GRUPOS.CONSULTAR)
    async getTotal(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.gruposSrv.count(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.GRUPOS.ACCESOFORMULARIO)
    async getLastId(): Promise<number> {
        return this.gruposSrv.getLastId();
    }

    @Get(':id')
    @AllowedIn(Permissions.GRUPOS.ACCESOFORMULARIO)
    async findById(
        @Param('id') id: number
    ): Promise<Grupo> {
        return this.gruposSrv.findById(id);
    }

    @Post()
    @AllowedIn(Permissions.GRUPOS.REGISTRAR)
    async create(
        @Body() grupo: GrupoDTO,
        @Headers('authorization') auth: string
    ) {
        await this.gruposSrv.create(
            DTOEntityUtis.grupoDtoToEntity(grupo),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @AllowedIn(Permissions.GRUPOS.EDITAR)
    async update(
        @Body() grupo: GrupoDTO,
        @Param('id') idviejo: number,
        @Headers('authorization') auth: string
    ) {
        await this.gruposSrv.update(
            idviejo,
            DTOEntityUtis.grupoDtoToEntity(grupo),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @AllowedIn(Permissions.GRUPOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.gruposSrv.delete(
            id,
            this.jwtUtils.extractJwtSub(auth)
        );
    }
}
