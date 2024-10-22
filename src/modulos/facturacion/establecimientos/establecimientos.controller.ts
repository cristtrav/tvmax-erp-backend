import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { EstablecimientosService } from './establecimientos.service';
import { EstablecimientoDTO } from '@dto/facturacion/establecimiento.dto';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('establecimientos')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class EstablecimientosController {

    constructor(
        private establecimientosSrv: EstablecimientosService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(Permissions.ESTABLECIMIENTOS.CONSULTAR)
    async findAll(
        @Query() queries: QueriesType
    ): Promise<EstablecimientoDTO[]>{
        return (await this.establecimientosSrv.findAll(queries)).map(e => e.toDTO());
    }

    @Get('count')
    @AllowedIn(Permissions.ESTABLECIMIENTOS.CONSULTAR)
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.establecimientosSrv.count(queries);
    }

    @Get(':id')
    @AllowedIn(Permissions.ESTABLECIMIENTOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<EstablecimientoDTO>{
        return (await this.establecimientosSrv.findById(id)).toDTO();
    }

    @Post()
    @AllowedIn(Permissions.ESTABLECIMIENTOS.REGISTRAR)
    async create(
        @Body() establecimientoDto: EstablecimientoDTO,
        @Headers('authorization') auth: string
    ){
        await this.establecimientosSrv.create(
            new Establecimiento().fromDTO(establecimientoDto),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @AllowedIn(Permissions.ESTABLECIMIENTOS.EDITAR)
    async edit(
        @Body() establecimientoDto: EstablecimientoDTO,
        @Param('id') oldId: number,
        @Headers('authorization') auth: string
    ){
        await this.establecimientosSrv.edit(
            oldId,
            new Establecimiento().fromDTO(establecimientoDto),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @AllowedIn(Permissions.ESTABLECIMIENTOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.establecimientosSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }

}
type QueriesType = {[name: string]: any}