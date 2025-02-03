import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Sorteo } from '@database/entity/sorteos/sorteo.entity';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { PremioView } from '@database/view/sorteos/premio.view';
import { PremiosService } from '@modulos/premios/premios.service';
import { ParticipanteView } from '@database/view/sorteos/participante.view';
import { SorteoView } from '@database/view/sorteos/sorteo.view';
import { Permissions } from '@auth/permission.list';
import { SorteoDTO } from '@dto/sorteos/sorteo.dto';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';

@Controller('sorteos')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class SorteosController {

    constructor(
        private jwtUtil: JwtUtilsService,
        private sorteosSrv: SorteosService,
        private premiosSrv: PremiosService
    ){}

    @Get()
    @AllowedIn(Permissions.SORTEOS.CONSULTAR)
    findAll(
        @Query() queries: QueriesType
    ): Promise<SorteoView[]>{
        return this.sorteosSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.SORTEOS.CONSULTAR)
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.sorteosSrv.count(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.SORTEOS.ACCESOFORMULARIO)
    getLastId(): Promise<number>{
        return this.sorteosSrv.getLastId();
    }

    @Get(':id')
    @AllowedIn(
        Permissions.SORTEOS.ACCESOFORMULARIO,
        Permissions.SORTEOS.REALIZARSORTEO
    )
    findById(
        @Param('id') id: number
    ): Promise<Sorteo>{
        return this.sorteosSrv.findById(id);
    }

    @Get(':id/premios')
    @AllowedIn(Permissions.SORTEOS.REALIZARSORTEO)
    findPremiosBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<PremioView[]>{
        return this.premiosSrv.findAll({...queries, idsorteo});
    }

    @Get(':id/premios/total')
    @AllowedIn(Permissions.PREMIOSSORTEOS.ACCESOMODULO)
    countPremiosBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.premiosSrv.count({...queries, idsorteo});
    }

    @Get(':id/participantes')
    @AllowedIn(
        Permissions.PARTICIPANTESSORTEOS.CONSULTAR,
        Permissions.SORTEOS.REALIZARSORTEO
    )
    async findAllParticipantesBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<ParticipanteView[]>{
        return await this.sorteosSrv.findAllParticipantesBySorteo(idsorteo, queries);
    }

    @Get(':id/participantes/total')
    @AllowedIn(Permissions.PARTICIPANTESSORTEOS.CONSULTAR)
    async countParticipantesBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.sorteosSrv.countParticipantesBySorteo(idsorteo, queries);
    }

    @Post()
    @AllowedIn(Permissions.SORTEOS.REGISTRAR)
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
    @AllowedIn(Permissions.PARTICIPANTESSORTEOS.AGREGAR)
    async agregarParticipantes(
        @Param('id') idsorteo: number,
        @Body() criterios: CriteriosSorteoType
    ){        
        await this.sorteosSrv.agregarParticipantes(criterios, idsorteo);
    }

    @Put(':id')
    @AllowedIn(Permissions.SORTEOS.EDITAR)
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
    @AllowedIn(Permissions.SORTEOS.ELIMINAR)    
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.sorteosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

    @Delete(':idsorteo/participantes/:idcliente')
    @AllowedIn(Permissions.PARTICIPANTESSORTEOS.ELIMINAR)
    async deleteParticipante(
        @Param('idsorteo') idsorteo: number,
        @Param('idcliente') idcliente: number
    ){
        await this.sorteosSrv.deleteParticipante(idcliente, idsorteo);
    }

}

type QueriesType = { [name: string]: any }
type CriteriosSorteoType = { suscritoshasta: string, aldiahasta: string }