import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards, Headers, UseFilters } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { BarriosService } from './barrios.service';
import { BarrioDTO } from '../../dto/barrio.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { BarrioView } from '@database/view/barrio.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';

@Controller('barrios')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class BarriosController {

    constructor(
        private barriosSrv: BarriosService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.BARRIOS.CONSULTAR)
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<BarrioView[]> {
        return this.barriosSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.BARRIOS.CONSULTAR)
    async count(
        @Query() queries: { [name: string]: any }
    ) {
        return this.barriosSrv.count(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.BARRIOS.CONSULTARULTIMOID)
    async getLastId(): Promise<number> {
        try {
            return await this.barriosSrv.getLastId();
        } catch (e) {
            console.log('Error al consultar ultimo id de Barrios');
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

    @Post()
    @RequirePermission(Permissions.BARRIOS.REGISTRAR)
    async create(
        @Body() b: BarrioDTO,
        @Headers('authorization') auth: string
    ) {
        await this.barriosSrv.create(
            DTOEntityUtis.barrioDtoToEntity(b),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Get(':id')
    @RequirePermission(Permissions.BARRIOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<BarrioView> {
        return this.barriosSrv.findById(id);
    }

    @Put(':id')
    @RequirePermission(Permissions.BARRIOS.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() b: BarrioDTO,
        @Headers('authorization') auth: string
    ) {
        await this.barriosSrv.edit(
            oldId,
            DTOEntityUtis.barrioDtoToEntity(b),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @RequirePermission(Permissions.BARRIOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        this.barriosSrv.delete(
            id,
            this.jwtUtils.extractJwtSub(auth)
        );
    }
}
