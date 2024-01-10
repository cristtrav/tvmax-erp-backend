import { Body, Controller, Delete, Get, Header, Headers, Param, Post, Put, Query, UseFilters } from '@nestjs/common';
import { MovimientosMaterialesService } from './movimientos-materiales.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { MovimientoMaterialDTO } from '@dto/movimiento-material.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { DetallesMovimientosMaterialesService } from './detalles-movimientos-materiales/detalles-movimientos-materiales.service';
import { DetalleMovimientoMaterialView } from '@database/view/depositos/detalle-movimiento-material.view';
import { MovimientoMaterialView } from '@database/view/depositos/movimiento-material.view';

@Controller('movimientosmateriales')
@UseFilters(HttpExceptionFilter)
export class MovimientosMaterialesController {

    constructor(
        private movimientosMaterialesSrv: MovimientosMaterialesService,
        private detallesMovimientosMaterialesSrv: DetallesMovimientosMaterialesService,
        private jwtUtilSrv: JwtUtilsService
    ){}

    @Get()
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<MovimientoMaterialView[]>{
        return this.movimientosMaterialesSrv.findAll(queries);
    }

    @Get('total')
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.movimientosMaterialesSrv.count(queries);
    }

    @Post()
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
    async getLastId(
        @Query() queries: {[name: string]: any},
        @Headers('authorization') auth: string
    ): Promise<number>{
        return this.movimientosMaterialesSrv.getLastId(queries);
    }
    
    @Get(':id/detalles')
    findAllDetalles(
        @Query() queries: {[name: string]: any},
        @Param('id') id: number
    ): Promise<DetalleMovimientoMaterialView[]>{
        return this.detallesMovimientosMaterialesSrv.findByIdMovimiento(id, queries);
    }

    @Get(':id/detalles/total')
    countDetalles(
        @Query() queries: {[name: string]: any},
        @Param('id') id: number
    ): Promise<number>{
        return this.detallesMovimientosMaterialesSrv.countByIdMovimiento(id, queries);
    }

    @Get(':id')
    findById(
        @Param('id') id: number
    ): Promise<MovimientoMaterialView>{
        return this.movimientosMaterialesSrv.findById(id);
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.movimientosMaterialesSrv.delete(id, this.jwtUtilSrv.extractJwtSub(auth));
    }

    @Put()
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
