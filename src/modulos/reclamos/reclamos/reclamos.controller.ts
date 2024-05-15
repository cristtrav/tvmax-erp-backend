import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { ReclamoDTO } from '@dto/reclamos/reclamo.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { EstadoReclamoType, Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { ReclamoView } from '@database/view/reclamos/reclamo.view';
import { DetallesReclamosService } from './detalles-reclamos/detalles-reclamos.service';
import { DetalleReclamoView } from '@database/view/reclamos/detalle-reclamo.view';
import { DetalleReclamo } from '@database/entity/reclamos/detalle-reclamo.entity';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { FinalizacionReclamoDTO } from '@dto/reclamos/finalizacion-reclamo.dto';
import { MaterialUtilizadoView } from '@database/view/reclamos/material-utilizado.view';
import { EventosCambiosEstadosView } from '@database/view/reclamos/eventos-cambios-estados.view';
import { EventosCambiosEstadosService } from '../eventos-cambios-estados/eventos-cambios-estados.service';

type QueriesType = {[name: string]: any}

@Controller('reclamos')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class ReclamosController {

    constructor(
        private reclamosSrv: ReclamosService,
        private detalleReclamosSrv: DetallesReclamosService,
        private jwtUtilsSrv: JwtUtilsService,
        private eventosCambiosEstadosSrv: EventosCambiosEstadosService
    ){}

    @Get()
    @AllowedIn(
        Permissions.RECLAMOS.CONSULTAR,
        Permissions.ASIGNACIONESRECLAMOS.ACCESOMODULO
    )
    findAll(
        @Query() queries: QueriesType
    ): Promise<ReclamoView[]>{
        return this.reclamosSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(
        Permissions.RECLAMOS.CONSULTAR,
        Permissions.ASIGNACIONESRECLAMOS.ACCESOMODULO
    )
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.reclamosSrv.count(queries);
    }

    @Get(':id/detalles')
    @AllowedIn(
        Permissions.RECLAMOS.ACCESOMODULO,
        Permissions.ASIGNACIONESRECLAMOS.ACCESOMODULO
    )
    findDetallesByReclamos(
        @Param('id') idreclamo: number,
        @Query() queries: QueriesType
    ): Promise<DetalleReclamoView[]>{
        return this.detalleReclamosSrv.findDetallesByReclamo(idreclamo, queries);
    }

    @Get(':id/materiales')
    @AllowedIn(Permissions.ASIGNACIONESRECLAMOS.ACCESOFORMULARIOFINALIZAR)
    findMaterialesUtilizados(
        @Param('id') idreclamo: number,
        @Query() queries: QueriesType
    ): Promise<MaterialUtilizadoView[]>{
        return this.reclamosSrv.findMaterialesUtilizados({idreclamo, ...queries});
    }

    @Get(':id/cambiosestados')
    @AllowedIn(Permissions.RECLAMOS.ACCESOMODULO)
    findEventosCambiosEstados(
        @Param('id') idreclamo: number,
        @Query() queries: QueriesType
    ): Promise<EventosCambiosEstadosView[]>{
        return this.eventosCambiosEstadosSrv.findAllEventosCambiosEstados({idreclamo, ...queries});
    }

    @Get(':id')
    @AllowedIn(Permissions.ASIGNACIONESRECLAMOS.ACCESOMODULO)
    findById(
        @Param('id') idreclamo: number
    ): Promise<ReclamoView>{
        return this.reclamosSrv.findById(idreclamo);
    }

    @Post()
    @AllowedIn(Permissions.RECLAMOS.REGISTRAR)
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

    @Post(':id/asignarresponsable')
    @AllowedIn(Permissions.ASIGNACIONESRECLAMOS.TOMARLIBERARRECLAMO)
    async asignarResponsable(
        @Param('id') idreclamo: number,
        @Body() body: { idusuarioresponsable: number },
        @Headers('authorization') auth: string
    ){
        await this.reclamosSrv.asignarResponsable(
            idreclamo,
            body.idusuarioresponsable,
            this.jwtUtilsSrv.extractJwtSub(auth)
        );
    }

    @Delete(':id/liberarresponsable')
    @AllowedIn(Permissions.ASIGNACIONESRECLAMOS.TOMARLIBERARRECLAMO)
    async liberarResponsable(
        @Param('id') idreclamo: number,
        @Headers('authorization') auth: string
    ){
        await this.reclamosSrv.liberarResponsable(
            idreclamo,
            this.jwtUtilsSrv.extractJwtSub(auth)
        );
    }

    @Put(':id/estado')
    @AllowedIn(Permissions.ASIGNACIONESRECLAMOS.CAMBIARESTADO)
    async cambiarEstado(
        @Param('id') idreclamo: number,
        @Body() body: { estado: EstadoReclamoType, observacion: string },
        @Headers('authorization') auth: string
    ){
        await this.reclamosSrv.cambiarEstado(idreclamo, body, this.jwtUtilsSrv.extractJwtSub(auth));
    }

    @Post(':id/finalizar')
    @AllowedIn(Permissions.ASIGNACIONESRECLAMOS.FINALIZARRECLAMO)
    async finalizarReclamo(
        @Param('id') idreclamo: number,
        @Body() finalizacion: FinalizacionReclamoDTO,
        @Headers('authorization') auth: string
    ){
        await this.reclamosSrv.finalizarReclamo(idreclamo, finalizacion, this.jwtUtilsSrv.extractJwtSub(auth));
    }

    @Put(':id/finalizar')
    @AllowedIn(Permissions.ASIGNACIONESRECLAMOS.EDITARFINALIZACIONRECLAMO)
    async editarFinalizacion(
        @Param('id') idreclamo: number,
        @Body() finalizacion: FinalizacionReclamoDTO,
        @Headers('authorization') auth: string
    ){
        await this.reclamosSrv.editarFinanalizacion(idreclamo, finalizacion, this.jwtUtilsSrv.extractJwtSub(auth));
    }

    @Put(':id')
    @AllowedIn(Permissions.RECLAMOS.EDITAR)
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
    @AllowedIn(Permissions.RECLAMOS.ELIMINAR)
    async delete(
        @Param('id') idreclamo: number,
        @Headers('authorization') auth: string
    ){
        await this.reclamosSrv.delete(idreclamo, this.jwtUtilsSrv.extractJwtSub(auth));
    }
}
