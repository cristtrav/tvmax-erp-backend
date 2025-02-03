import { Body, Controller, Delete, Get, Header, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { MovimientosMaterialesService } from './movimientos-materiales.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { DetallesMovimientosMaterialesService } from './detalles-movimientos-materiales/detalles-movimientos-materiales.service';
import { DetalleMovimientoMaterialView } from '@database/view/depositos/detalle-movimiento-material.view';
import { MovimientoMaterialView } from '@database/view/depositos/movimiento-material.view';
import { Permissions } from '@auth/permission.list';
import { MovimientoMaterialDTO } from '@dto/depositos/movimiento-material.dto';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('movimientosmateriales')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class MovimientosMaterialesController {

    constructor(
        private movimientosMaterialesSrv: MovimientosMaterialesService,
        private detallesMovimientosMaterialesSrv: DetallesMovimientosMaterialesService,
        private jwtUtilSrv: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<MovimientoMaterialView[]>{
        return this.movimientosMaterialesSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.movimientosMaterialesSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.REGISTRAR)
    async create(
        @Body() movimiento: MovimientoMaterialDTO,
        @Headers('authorization') auth: string
    ): Promise<number>{
        return await this.movimientosMaterialesSrv.create(
            DTOEntityUtis.movimientoMaterialDTOtoEntity(movimiento),
            movimiento.detalles.map(detalleDTO => DTOEntityUtis.detalleMovimientoMaterialDTOtoEntity(detalleDTO)),
            this.jwtUtilSrv.extractJwtSub(auth)
        );
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO)
    async getLastId(
        @Query() queries: {[name: string]: any},
        @Headers('authorization') auth: string
    ): Promise<number>{
        return this.movimientosMaterialesSrv.getLastId(queries);
    }
    
    @Get(':id/detalles')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ACCESOMODULO)
    findAllDetalles(
        @Query() queries: {[name: string]: any},
        @Param('id') id: number
    ): Promise<DetalleMovimientoMaterialView[]>{
        return this.detallesMovimientosMaterialesSrv.findByIdMovimiento(id, queries);
    }

    @Get(':id/detalles/total')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ACCESOMODULO)
    countDetalles(
        @Query() queries: {[name: string]: any},
        @Param('id') id: number
    ): Promise<number>{
        return this.detallesMovimientosMaterialesSrv.countByIdMovimiento(id, queries);
    }

    @Get(':id')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO)
    findById(
        @Param('id') id: number
    ): Promise<MovimientoMaterialView>{
        return this.movimientosMaterialesSrv.findById(id);
    }

    @Delete(':id')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.movimientosMaterialesSrv.delete(id, this.jwtUtilSrv.extractJwtSub(auth));
    }

    @Put()
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.EDITAR)
    async update(
        @Body() movimientoDto: MovimientoMaterialDTO,
        @Headers('authorization') auth: string
    ){
        await this.movimientosMaterialesSrv.update(
            DTOEntityUtis.movimientoMaterialDTOtoEntity(movimientoDto),
            movimientoDto.detalles.map(d => DTOEntityUtis.detalleMovimientoMaterialDTOtoEntity(d)),
            this.jwtUtilSrv.extractJwtSub(auth)
        );
    }
}
