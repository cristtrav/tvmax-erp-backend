import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Sorteo } from '@database/entity/sorteos/sorteo.entity';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { PremioView } from '@database/view/sorteos/premio.view';
import { PremiosService } from '@modulos/premios/premios.service';
import { ParticipanteView } from '@database/view/sorteos/participante.view';
import { SorteoView } from '@database/view/sorteos/sorteo.view';
import { AuthGuard } from '@auth/auth.guard';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Permissions } from '@auth/permission.list';
import { SorteoDTO } from '@dto/sorteos/sorteo.dto';

@Controller('sorteos')
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
export class SorteosController {

    constructor(
        private jwtUtil: JwtUtilsService,
        private sorteosSrv: SorteosService,
        private premiosSrv: PremiosService
    ){}

    @Get()
    @RequirePermission(Permissions.SORTEOS.CONSULTAR)
    findAll(
        @Query() queries: QueriesType
    ): Promise<SorteoView[]>{
        return this.sorteosSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.SORTEOS.CONSULTAR)
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.sorteosSrv.count(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.SORTEOS.CONSULTARULTIMOID)
    getLastId(): Promise<number>{
        return this.sorteosSrv.getLastId();
    }

    @Get(':id')
    @RequirePermission(Permissions.SORTEOS.CONSULTAR)
    findById(
        @Param('id') id: number
    ): Promise<Sorteo>{
        return this.sorteosSrv.findById(id);
    }

    @Get(':id/premios')
    @RequirePermission(Permissions.PREMIOSSORTEOS.CONSULTAR)
    findPremiosBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<PremioView[]>{
        return this.premiosSrv.findAll({...queries, idsorteo});
    }

    @Get(':id/premios/total')
    @RequirePermission(Permissions.PREMIOSSORTEOS.CONSULTAR)
    countPremiosBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.premiosSrv.count({...queries, idsorteo});
    }

    @Get(':id/participantes')
    @RequirePermission(Permissions.PARTICIPANTESSORTEOS.CONSULTAR)
    async findAllParticipantesBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<ParticipanteView[]>{
        return await this.sorteosSrv.findAllParticipantesBySorteo(idsorteo, queries);
    }

    @Get(':id/participantes/total')
    @RequirePermission(Permissions.PARTICIPANTESSORTEOS.CONSULTAR)
    async countParticipantesBySorteo(
        @Param('id') idsorteo: number,
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.sorteosSrv.countParticipantesBySorteo(idsorteo, queries);
    }

    @Post()
    @RequirePermission(Permissions.SORTEOS.REGISTRAR)
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
    @RequirePermission(Permissions.PARTICIPANTESSORTEOS.AGREGAR)
    async agregarParticipantes(
        @Param('id') idsorteo: number,
        @Body() criterios: CriteriosSorteoType
    ){        
        await this.sorteosSrv.agregarParticipantes(criterios, idsorteo);
    }

    @Put(':id')
    @RequirePermission(Permissions.SORTEOS.EDITAR)
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
    @RequirePermission(Permissions.SORTEOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.sorteosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

    @Delete(':idsorteo/participantes/:idcliente')
    @RequirePermission(Permissions.PARTICIPANTESSORTEOS.ELIMINAR)
    async deleteParticipante(
        @Param('idsorteo') idsorteo: number,
        @Param('idcliente') idcliente: number
    ){
        await this.sorteosSrv.deleteParticipante(idcliente, idsorteo);
    }

}

type QueriesType = { [name: string]: any }
type CriteriosSorteoType = { suscritoshasta: string, aldiahasta: string }