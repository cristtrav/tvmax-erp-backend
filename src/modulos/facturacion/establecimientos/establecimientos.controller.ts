import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { EstablecimientosService } from './establecimientos.service';
import { EstablecimientoDTO } from '@dto/facturacion/establecimiento.dto';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Controller('establecimientos')
@UseGuards(LoginGuard)
@UseFilters(HttpExceptionFilter)
export class EstablecimientosController {

    constructor(
        private establecimientosSrv: EstablecimientosService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    async findAll(
        @Query() queries: QueriesType
    ): Promise<EstablecimientoDTO[]>{
        return (await this.establecimientosSrv.findAll(queries)).map(e => e.toDTO());
    }

    @Get('count')
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.establecimientosSrv.count(queries);
    }

    @Get(':id')
    async findById(
        @Param('id') id: number
    ): Promise<EstablecimientoDTO>{
        return (await this.establecimientosSrv.findById(id)).toDTO();
    }

    @Post()
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
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.establecimientosSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }

}
type QueriesType = {[name: string]: any}