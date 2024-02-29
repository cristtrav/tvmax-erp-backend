import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { ReclamoDTO } from '@dto/reclamos/reclamo.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { ReclamoView } from '@database/view/reclamos/reclamo.view';
import { DetallesReclamosService } from './detalles-reclamos/detalles-reclamos.service';
import { DetalleReclamoView } from '@database/view/reclamos/detalle-reclamo.view';
import { DetalleReclamo } from '@database/entity/reclamos/detalle-reclamo.entity';

type QueriesType = {[name: string]: any}

@Controller('reclamos')
@UseFilters(HttpExceptionFilter)
export class ReclamosController {

    constructor(
        private reclamosSrv: ReclamosService,
        private detalleReclamosSrv: DetallesReclamosService,
        private jwtUtilsSrv: JwtUtilsService
    ){}

    @Get()
    findAll(
        @Query() queries: QueriesType
    ): Promise<ReclamoView[]>{
        return this.reclamosSrv.findAll(queries);
    }

    @Get('total')
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.reclamosSrv.count(queries);
    }

    @Get(':id/detalles')
    findDetallesByReclamos(
        @Param('id') idreclamo: number,
        @Query() queries: QueriesType
    ): Promise<DetalleReclamoView[]>{
        return this.detalleReclamosSrv.findDetallesByReclamo(idreclamo, queries);
    }

    @Get(':id')
    findById(
        @Param('id') idreclamo: number
    ): Promise<ReclamoView>{
        return this.reclamosSrv.findById(idreclamo);
    }

    @Post()
    async create(
        @Body() reclamoDto: ReclamoDTO,
        @Headers('authorization') auth: string
    ): Promise<number>{
        return await this.reclamosSrv.create(
            new Reclamo().fromDTO(reclamoDto),
            reclamoDto.detalles.map(dDto => new DetalleReclamo().fromDTO(dDto)),
            this.jwtUtilsSrv.extractJwtSub(auth)
        );
    }

    @Put(':id')
    async update(
        @Param('id') oldId: number,
        @Body() reclamoDto: ReclamoDTO,
        @Headers('authorization') auth: string
    ){
        await this.reclamosSrv.update(
            oldId,
            new Reclamo().fromDTO(reclamoDto),
            reclamoDto.detalles.map(d => new DetalleReclamo().fromDTO(d)),
            this.jwtUtilsSrv.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    async delete(
        @Param('id') idreclamo: number,
        @Headers('authorization') auth: string
    ){
        await this.reclamosSrv.delete(idreclamo, this.jwtUtilsSrv.extractJwtSub(auth));
    }
}
