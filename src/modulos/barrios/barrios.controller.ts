import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards, Headers, UseFilters } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { BarriosService } from './barrios.service';
import { BarrioDTO } from '../../global/dto/barrio.dto';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { BarrioView } from '@database/view/barrio.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('barrios')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class BarriosController {

    constructor(
        private barriosSrv: BarriosService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @AllowedIn(
        Permissions.BARRIOS.CONSULTAR,
        Permissions.DOMICILIOS.ACCESOFORMULARIO,
        Permissions.CLIENTES.ACCESOMODULO,
        Permissions.SUSCRIPCIONES.ACCESOMODULO
    )
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<BarrioView[]> {
        return this.barriosSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.BARRIOS.CONSULTAR)
    async count(
        @Query() queries: { [name: string]: any }
    ) {
        return this.barriosSrv.count(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.BARRIOS.ACCESOFORMULARIO)
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
    @AllowedIn(Permissions.BARRIOS.REGISTRAR)
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
    @AllowedIn(Permissions.BARRIOS.ACCESOFORMULARIO)
    async findById(
        @Param('id') id: number
    ): Promise<BarrioView> {
        return this.barriosSrv.findById(id);
    }

    @Put(':id')
    @AllowedIn(Permissions.BARRIOS.EDITAR)
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
    @AllowedIn(Permissions.BARRIOS.ELIMINAR)
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
