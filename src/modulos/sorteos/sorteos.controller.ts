import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Sorteo } from '@database/entity/sorteos/sorteo.entity';
import { SorteoDTO } from '@dto/sorteo.dto';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { PremioView } from '@database/view/sorteos/premio.view';
import { PremiosService } from '@modulos/premios/premios.service';

@Controller('sorteos')
@UseFilters(HttpExceptionFilter)
export class SorteosController {

    constructor(
        private jwtUtil: JwtUtilsService,
        private sorteosSrv: SorteosService,
        private premiosSrv: PremiosService
    ){}

    @Get()
    findAll(
        @Query() queries: QueriesType
    ): Promise<Sorteo[]>{
        return this.sorteosSrv.findAll(queries);
    }

    @Get('total')
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.sorteosSrv.count(queries);
    }

    @Get('ultimoid')
    getLastId(): Promise<number>{
        return this.sorteosSrv.getLastId();
    }

    @Get(':id')
    findById(
        @Param('id') id: number
    ): Promise<Sorteo>{
        return this.sorteosSrv.findById(id);
    }

    @Get(':id/premios')
    findPremiosBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<PremioView[]>{
        return this.premiosSrv.findAll({...queries, idsorteo});
    }

    @Get(':id/premios/total')
    countPremiosBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.premiosSrv.count({...queries, idsorteo});
    }

    @Post()
    async create(
        @Body() sorteoDto: SorteoDTO,
        @Headers('authorization') auth: string
    ){
        await this.sorteosSrv.create(
            DTOEntityUtis.sorteoDtoToEntity(sorteoDto),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() sorteoDto: SorteoDTO,
        @Headers('authorization') auth: string
    ){
        await this.sorteosSrv.update(
            id,
            DTOEntityUtis.sorteoDtoToEntity(sorteoDto),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.sorteosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

}

type QueriesType = {[name: string]: any}
