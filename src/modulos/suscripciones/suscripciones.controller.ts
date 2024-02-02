import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionDTO } from '../../global/dto/suscripcion.dto';
import { CuotasService } from '../cuotas/cuotas.service';
import { ServiciosService } from '../servicios/servicios.service'
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { CuotaView } from '@database/view/cuota.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { ServicioView } from '@database/view/servicio.view';

@Controller('suscripciones')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class SuscripcionesController {

    constructor(
        private suscripcionesSrv: SuscripcionesService,
        private cuotasSrv: CuotasService,
        private serviciosSrv: ServiciosService,
        private jwtUtil: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<SuscripcionView[]> {
        return this.suscripcionesSrv.findAll(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTARULTIMOID)
    getLastId(
    ): Promise<number> {
        return this.suscripcionesSrv.getLastId();
    }

    @Get('total')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number> {
        return this.suscripcionesSrv.count(queries);
    }

    @Post()
    @RequirePermission(Permissions.SUSCRIPCIONES.REGISTRAR)
    async create(
        @Body() s: SuscripcionDTO,
        @Headers('authorization') auth: string
    ) {
        await this.suscripcionesSrv.create(
            DTOEntityUtis.suscripcionDtoToEntity(s),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Get(':id')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    findById(
        @Param('id') id: number
    ): Promise<SuscripcionView> {
        return this.suscripcionesSrv.findById(id);
    }

    @Put(':id')
    @RequirePermission(Permissions.SUSCRIPCIONES.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() s: SuscripcionDTO,
        @Headers('authorization') auth: string
    ) {
        await this.suscripcionesSrv.edit(
            oldId,
            DTOEntityUtis.suscripcionDtoToEntity(s),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @RequirePermission(Permissions.SUSCRIPCIONES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.suscripcionesSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

    @Get(':id/cuotas')
    @RequirePermission(Permissions.CUOTAS.CONSULTAR)
    async getCuotasBySuscripcion(
        @Param('id') idsuscripcion: number,
        @Query() queries: { [name: string]: any }
    ): Promise<CuotaView[]> {
        return this.cuotasSrv.findAll({ ...queries, idsuscripcion });
    }
    
    @Get(':id/cuotas/total')
    @RequirePermission(Permissions.CUOTAS.CONSULTAR)
    async countCuotasBySuscripcion(
        @Param('id') idsuscripcion: number,
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.cuotasSrv.count({ ...queries, idsuscripcion });
    }

    @Get(':id/cuotas/servicios')
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    async getServiciosByCuotas(
        @Param('id') idsuscripcion: number,
        @Query() queries: {[name: string]: any}
    ): Promise<ServicioView[]> {
        return this.serviciosSrv.getServiciosEnCuotas(idsuscripcion, queries);
    }

    @Get(':id/cuotas/servicios/total')
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    countServiciosByCuotas(
        @Param('id') idsuscripcion: number,
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.serviciosSrv.countServiciosEnCuotas(idsuscripcion, queries);
    }
    
}
