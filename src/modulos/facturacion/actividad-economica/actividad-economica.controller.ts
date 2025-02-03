import { LoginGuard } from '@auth/guards/login.guard';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ActividadEconomicaService } from './actividad-economica.service';
import { ActividadEconomicaDTO } from '@dto/facturacion/actividad-economica.dto';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('actividadeseconomicas')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class ActividadEconomicaController {

    constructor(
        private actividadesEconomicasSrv: ActividadEconomicaService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(Permissions.ACTIVIDADESECONOMICAS.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<ActividadEconomica[]>{
        return this.actividadesEconomicasSrv.findAll(queries);
    }

    @Get('count')
    @AllowedIn(Permissions.ACTIVIDADESECONOMICAS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.actividadesEconomicasSrv.count(queries);
    }

    @Get(':id')
    @AllowedIn(Permissions.ACTIVIDADESECONOMICAS.CONSULTAR)
    findById(
        @Param('id') id: string
    ): Promise<ActividadEconomica>{
        return this.actividadesEconomicasSrv.findById(id);
    }

    @Post()
    @AllowedIn(Permissions.ACTIVIDADESECONOMICAS.REGISTRAR)
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
    @AllowedIn(Permissions.ACTIVIDADESECONOMICAS.EDITAR)
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
    @AllowedIn(Permissions.ACTIVIDADESECONOMICAS.ELIMINAR)
    async delete(
        @Param('id') id: string,
        @Headers('authorization') auth: string
    ){
        await this.actividadesEconomicasSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
}
