import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { SuscripcionesService } from '../service/suscripciones.service';
import { SuscripcionDTO } from '../../../global/dto/suscripcion.dto';
import { CuotasService } from '../../cuotas/service/cuotas.service';
import { ServiciosService } from '../../servicios/servicios.service'
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { CuotaView } from '@database/view/cuota.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { ServicioView } from '@database/view/servicio.view';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';

@Controller('suscripciones')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class SuscripcionesController {

    constructor(
        private suscripcionesSrv: SuscripcionesService,
        private cuotasSrv: CuotasService,
        private serviciosSrv: ServiciosService,
        private jwtUtil: JwtUtilsService
    ) { }

    @Get()
    @AllowedIn(Permissions.SUSCRIPCIONES.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<SuscripcionView[]> {
        return this.suscripcionesSrv.findAll(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.SUSCRIPCIONES.CONSULTARULTIMOID)
    getLastId(
    ): Promise<number> {
        return this.suscripcionesSrv.getLastId();
    }

    @Get('total')
    @AllowedIn(Permissions.SUSCRIPCIONES.CONTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number> {
        return this.suscripcionesSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.SUSCRIPCIONES.REGISTRAR)
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
    @AllowedIn(
        Permissions.SUSCRIPCIONES.CONSULTAR,
        Permissions.CUOTAS.ACCESOMODULO
    )
    findById(
        @Param('id') id: number
    ): Promise<SuscripcionView> {
        return this.suscripcionesSrv.findById(id);
    }

    @Put(':id')
    @AllowedIn(Permissions.SUSCRIPCIONES.EDITAR)
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
    @AllowedIn(Permissions.SUSCRIPCIONES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.suscripcionesSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

    @Get(':id/cuotas')
    @AllowedIn(Permissions.CUOTAS.CONSULTAR)
    async getCuotasBySuscripcion(
        @Param('id') idsuscripcion: number,
        @Query() queries: { [name: string]: any }
    ): Promise<CuotaView[]> {
        return this.cuotasSrv.findAll({ ...queries, idsuscripcion });
    }
    
    @Get(':id/cuotas/total')
    @AllowedIn(Permissions.CUOTAS.CONSULTAR)
    async countCuotasBySuscripcion(
        @Param('id') idsuscripcion: number,
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.cuotasSrv.count({ ...queries, idsuscripcion });
    }

    @Get(':id/cuotas/servicios')
    @AllowedIn(
        Permissions.CUOTAS.ACCESOMODULO,
        Permissions.POS.ACCESOMODULO,
        Permissions.POSMOVIL.ACCESOMODULO
    )
    async getServiciosByCuotas(
        @Param('id') idsuscripcion: number,
        @Query() queries: {[name: string]: any}
    ): Promise<ServicioView[]> {
        return this.serviciosSrv.getServiciosEnCuotas(idsuscripcion, queries);
    }

    @Get(':id/cuotas/servicios/total')
    @AllowedIn(Permissions.CUOTAS.CONSULTAR)
    countServiciosByCuotas(
        @Param('id') idsuscripcion: number,
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.serviciosSrv.countServiciosEnCuotas(idsuscripcion, queries);
    }
    
}
