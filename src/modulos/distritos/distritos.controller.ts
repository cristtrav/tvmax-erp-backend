import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Headers, UseFilters } from '@nestjs/common';
import { DistritoDTO } from '../../global/dto/distrito.dto';
import { Permissions } from '../../global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { DistritosService } from './distritos.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DistritoView } from '@database/view/distritos.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';

@Controller('distritos')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class DistritosController {

    constructor(
        private distritosSrv: DistritosService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.DISTRITOS.CONSULTAR)
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<DistritoView[]> {
        return this.distritosSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.DISTRITOS.CONSULTAR)
    async count(
        @Query() queries: {[name: string]: any }
    ): Promise<number> {
        return this.distritosSrv.count(queries);
    }

    @Post()
    @RequirePermission(Permissions.DISTRITOS.REGISTRAR)
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
    @RequirePermission(Permissions.DISTRITOS.CONSULTAR)
    async findById(
        @Param('id') id: string
    ): Promise<DistritoView> {
        return this.distritosSrv.findById(id);
    }

    @Put(':id')
    @RequirePermission(Permissions.DISTRITOS.EDITAR)
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
    @RequirePermission(Permissions.DISTRITOS.ELIMINAR)
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
