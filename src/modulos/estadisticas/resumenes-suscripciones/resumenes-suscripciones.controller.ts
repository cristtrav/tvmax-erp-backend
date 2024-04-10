import { ResumenCuotasPendientesSuscripcionesDTO } from 'src/global/dto/resumen-cuotas-pendientes-suscripciones.dto';
import { ResumenEstadosSuscripcionesDTO } from 'src/global/dto/resumen-estados-suscripciones.dto';
import { ResumenGruposSuscripcionesDTO } from 'src/global/dto/resumen-grupos-suscripciones.dto';
import { ResumenServiciosSuscripcionDTO } from 'src/global/dto/resumen-servicios-suscripcion.dto';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ResumenesSuscripcionesService } from './resumenes-suscripciones.service';
import { Permissions } from '@auth/permission.list';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { ResumenDepartamentosSuscripcionesDTO } from 'src/global/dto/resumen-departamentos-suscripciones.dto';
import { ResumenDistritosSuscripcionesDTO } from 'src/global/dto/resumen-distritos-suscripciones.dto';
import { ResumenBarriosSuscripcionesDTO } from 'src/global/dto/resumen-barrios-suscripciones.dto';
import { ResumenGeneralSuscripcionesDTO } from 'src/global/dto/resumen-general-suscripciones.dto';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
@Controller('suscripciones/resumen')
export class ResumenesSuscripcionesController {

    constructor(
        private resumenesSuscSrv: ResumenesSuscripcionesService
    ){}

    @Get('cuotaspendientes')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    getResumenSuscCuotasPendientes(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenCuotasPendientesSuscripcionesDTO[]> {
        return this.resumenesSuscSrv.findAllResumenCuotasPendientes(queries);        
    }

    @Get('cuotaspendientes/total')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    getTotalResumenCuotasPendientes(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenCuotasPendientes(queries);
    }

    @Get('estados')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    getResumenSuscEstados(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenEstadosSuscripcionesDTO[]> {
        return this.resumenesSuscSrv.findAllResumenEstados(queries);
    }

    @Get('estados/total')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenEstados(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenEstados(queries);
    }

    @Get('grupos')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenGrupos(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenGruposSuscripcionesDTO[]>{
        return this.resumenesSuscSrv.findAllResumenGrupos(queries);
    }

    @Get('grupos/total')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenGrupos(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenGrupos(queries);
    }

    @Get('servicios')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenServicios(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenServiciosSuscripcionDTO[]>{
        return this.resumenesSuscSrv.findAllResumenServicios(queries);
    }

    @Get('servicios/total')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenServicios(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenServicios(queries);
    }

    @Get('departamentos')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenDepartamentos(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenDepartamentosSuscripcionesDTO[]>{
        return this.resumenesSuscSrv.findAllResumenDepartamentos(queries);
    }

    @Get('departamentos/total')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenDepartamentos(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenDepartamentos(queries);
    }

    @Get('distritos')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenDistritos(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenDistritosSuscripcionesDTO[]>{
        return this.resumenesSuscSrv.findAllResumenDistritos(queries);
    }

    @Get('distritos/total')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenDistritos(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenDistritos(queries);
    }

    @Get('barrios')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenBarrios(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenBarriosSuscripcionesDTO[]>{
        return this.resumenesSuscSrv.findAllResumenBarrios(queries);
    }

    @Get('barrios/total')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenBarrios(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenBarrios(queries);
    }

    @Get('general')
    @AllowedIn(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    getResumenGeneral(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenGeneralSuscripcionesDTO>{
        return this.resumenesSuscSrv.getResumenGeneral(queries);
    }

}
