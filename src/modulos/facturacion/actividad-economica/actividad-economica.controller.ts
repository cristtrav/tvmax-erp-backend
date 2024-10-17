import { LoginGuard } from '@auth/guards/login.guard';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ActividadEconomicaService } from './actividad-economica.service';
import { ActividadEconomicaDTO } from '@dto/facturacion/actividad-economica.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Controller('actividadeseconomicas')
//@UseGuards(LoginGuard)
//@UseFilters(HttpExceptionFilter)
export class ActividadEconomicaController {

    constructor(
        private actividadesEconomicasSrv: ActividadEconomicaService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<ActividadEconomica[]>{
        return this.actividadesEconomicasSrv.findAll(queries);
    }

    @Get('count')
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.actividadesEconomicasSrv.count(queries);
    }

    @Get(':id')
    findById(
        @Param('id') id: string
    ): Promise<ActividadEconomica>{
        return this.actividadesEconomicasSrv.findById(id);
    }

    @Post()
    async create(
        @Body() actividadDto: ActividadEconomicaDTO,
        @Headers('authorization') auth: string
    ){
        await this.actividadesEconomicasSrv.create(
            new ActividadEconomica().fromDTO(actividadDto),
            this.jwtUtils.extractJwtSub(auth)
        )
    }

    @Put(':id')
    async edit(
        @Body() actividadDto: ActividadEconomicaDTO,
        @Param('id') oldId: string,
        @Headers('authorization') auth: string
    ){
        await this.actividadesEconomicasSrv.edit(
            oldId,
            new ActividadEconomica().fromDTO(actividadDto),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    async delete(
        @Param('id') id: string,
        @Headers('authorization') auth: string
    ){
        await this.actividadesEconomicasSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
}
