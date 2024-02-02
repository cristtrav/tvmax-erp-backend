import { RequirePermission } from '@auth/require-permission.decorator';
import { ResumenCuotasPendientesSuscripcionesDTO } from 'src/global/dto/resumen-cuotas-pendientes-suscripciones.dto';
import { ResumenEstadosSuscripcionesDTO } from 'src/global/dto/resumen-estados-suscripciones.dto';
import { ResumenGruposSuscripcionesDTO } from 'src/global/dto/resumen-grupos-suscripciones.dto';
import { ResumenServiciosSuscripcionDTO } from 'src/global/dto/resumen-servicios-suscripcion.dto';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ResumenesSuscripcionesService } from './resumenes-suscripciones.service';
import { Permissions } from '@auth/permission.list';
import { AuthGuard } from '@auth/auth.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { ResumenDepartamentosSuscripcionesDTO } from 'src/global/dto/resumen-departamentos-suscripciones.dto';
import { ResumenDistritosSuscripcionesDTO } from 'src/global/dto/resumen-distritos-suscripciones.dto';
import { ResumenBarriosSuscripcionesDTO } from 'src/global/dto/resumen-barrios-suscripciones.dto';
import { ResumenGeneralSuscripcionesDTO } from 'src/global/dto/resumen-general-suscripciones.dto';

@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
@Controller('suscripciones/resumen')
export class ResumenesSuscripcionesController {

    constructor(
        private resumenesSuscSrv: ResumenesSuscripcionesService
    ){}

    @Get('cuotaspendientes')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    getResumenSuscCuotasPendientes(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenCuotasPendientesSuscripcionesDTO[]> {
        return this.resumenesSuscSrv.findAllResumenCuotasPendientes(queries);        
    }

    @Get('cuotaspendientes/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    getTotalResumenCuotasPendientes(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenCuotasPendientes(queries);
    }

    @Get('estados')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    getResumenSuscEstados(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenEstadosSuscripcionesDTO[]> {
        return this.resumenesSuscSrv.findAllResumenEstados(queries);
    }

    @Get('estados/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenEstados(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenEstados(queries);
    }

    @Get('grupos')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenGrupos(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenGruposSuscripcionesDTO[]>{
        return this.resumenesSuscSrv.findAllResumenGrupos(queries);
    }

    @Get('grupos/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenGrupos(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenGrupos(queries);
    }

    @Get('servicios')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenServicios(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenServiciosSuscripcionDTO[]>{
        return this.resumenesSuscSrv.findAllResumenServicios(queries);
    }

    @Get('servicios/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenServicios(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenServicios(queries);
    }

    @Get('departamentos')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenDepartamentos(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenDepartamentosSuscripcionesDTO[]>{
        return this.resumenesSuscSrv.findAllResumenDepartamentos(queries);
    }

    @Get('departamentos/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenDepartamentos(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenDepartamentos(queries);
    }

    @Get('distritos')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenDistritos(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenDistritosSuscripcionesDTO[]>{
        return this.resumenesSuscSrv.findAllResumenDistritos(queries);
    }

    @Get('distritos/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenDistritos(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenDistritos(queries);
    }

    @Get('barrios')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    findAllResumenBarrios(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenBarriosSuscripcionesDTO[]>{
        return this.resumenesSuscSrv.findAllResumenBarrios(queries);
    }

    @Get('barrios/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    countResumenBarrios(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.resumenesSuscSrv.countResumenBarrios(queries);
    }

    @Get('general')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    getResumenGeneral(
        @Query() queries: {[name: string]: any}
    ): Promise<ResumenGeneralSuscripcionesDTO>{
        return this.resumenesSuscSrv.getResumenGeneral(queries);
    }

}
