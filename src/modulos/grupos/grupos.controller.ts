import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, Headers, UseFilters } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { GrupoDTO } from './../../dto/grupo.dto';
import { AuthGuard } from './../../global/auth/auth.guard';
import { Permissions } from '../../global/auth/permission.list';
import { RequirePermission } from '../../global/auth/require-permission.decorator';
import { Grupo } from '@database/entity/grupo.entity';
import { DTOEntityUtis } from '@database/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';

@Controller('grupos')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class GruposController {

    constructor(
        private gruposSrv: GruposService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<Grupo[]> {
        return this.gruposSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async getTotal(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.gruposSrv.count(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async getLastId(): Promise<number> {
        return this.gruposSrv.getLastId();
    }

    @Get(':id')
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<Grupo> {
        return this.gruposSrv.findById(id);
    }

    @Post()
    @RequirePermission(Permissions.GRUPOS.REGISTRAR)
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
    @RequirePermission(Permissions.GRUPOS.EDITAR)
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
    @RequirePermission(Permissions.GRUPOS.ELIMINAR)
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
