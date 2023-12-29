import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Sorteo } from '@database/entity/sorteos/sorteo.entity';
import { SorteoDTO } from '@dto/sorteo.dto';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { PremioView } from '@database/view/sorteos/premio.view';
import { PremiosService } from '@modulos/premios/premios.service';
import { Cliente } from '@database/entity/cliente.entity';
import { ParticipanteView } from '@database/view/sorteos/participante.view';
import { SorteoView } from '@database/view/sorteos/sorteo.view';

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
    ): Promise<SorteoView[]>{
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

    @Get(':id/participantes')
    async findAllParticipantesBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<ParticipanteView[]>{
        return await this.sorteosSrv.findAllParticipantesBySorteo(idsorteo, queries);
    }

    @Get(':id/participantes/total')
    async countParticipantesBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.sorteosSrv.countParticipantesBySorteo(idsorteo, queries);
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

    @Post(':id/participantes/agregar')
    async agregarParticipantes(
        @Param('id') idsorteo: number,
        @Body() criterios: CriteriosSorteoType
    ){        
        await this.sorteosSrv.agregarParticipantes(criterios, idsorteo);
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

    @Delete(':idsorteo/participantes/:idcliente')
    async deleteParticipante(
        @Param('idsorteo') idsorteo: number,
        @Param('idcliente') idcliente: number
    ){
        await this.sorteosSrv.deleteParticipante(idcliente, idsorteo);
    }

}

type QueriesType = { [name: string]: any }
type CriteriosSorteoType = { suscritoshasta: string, aldiahasta: string }