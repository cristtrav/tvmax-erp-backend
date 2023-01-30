import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { SuscripcionesService } from './suscripciones.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';
import { SuscripcionDTO } from '../../dto/suscripcion.dto';
import { CuotasService } from '../cuotas/cuotas.service';
import { ServicioDTO } from '@dto/servicio.dto';
import { ServiciosService } from '../servicios/servicios.service'
import { ResumenCantMonto } from '@dto/resumen-cant-monto.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { CuotaView } from '@database/view/cuota.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { DTOEntityUtis } from '@database/dto-entity-utils';

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
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
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
        @Param('id') idsusc: number,
        @Query('eliminado') eliminado: boolean,
        @Query('pagado') pagado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<ServicioDTO>> {
        try {
            const data: ServicioDTO[] = await this.serviciosSrv.getServiciosEnCuotas(idsusc, { eliminado, pagado, sort, offset, limit });
            const count: number = await this.serviciosSrv.countServiciosEnCuotas(idsusc, { eliminado, pagado });
            return new ServerResponseList<ServicioDTO>(data, count);
        } catch (e) {
            console.log('Error al consultar servicios por cuotas');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('resumen/cuotaspendientes')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    async getResumenSuscCuotasPendientes(
        @Query('eliminado') eliminado: boolean,
        @Query('idcliente') idcliente: number,
        @Query('idgrupo') idgrupo: number[] | number,
        @Query('idservicio') idservicio: number[] | number,
        @Query('fechainiciosuscripcion') fechainiciosuscripcion: string,
        @Query('fechafinsuscripcion') fechafinsuscripcion: string,
        @Query('estado') estado: string[] | string,
        @Query('cuotaspendientesdesde') cuotaspendientesdesde: number,
        @Query('cuotaspendienteshasta') cuotaspendienteshasta: number,
        @Query('iddepartamento') iddepartamento: number | number[],
        @Query('iddistrito') iddistrito: number | number[],
        @Query('idbarrio') idbarrio: number | number[],
        @Query('search') search: string
    ): Promise<ServerResponseList<ResumenCantMonto>> {
        try {
            const data: ResumenCantMonto[] = await this.suscripcionesSrv.getResumenSuscCuotasPendientes(
                {
                    eliminado,
                    idcliente,
                    idgrupo,
                    idservicio,
                    fechainiciosuscripcion,
                    fechafinsuscripcion,
                    estado,
                    cuotaspendientesdesde,
                    cuotaspendienteshasta,
                    iddepartamento,
                    iddistrito,
                    idbarrio,
                    search
                }
            );
            return new ServerResponseList(data, data.length);
        } catch (e) {
            console.log('Error al consultar resument por cuotas pendientes');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('resumen/estados')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    async getResumenSuscEstados(
        @Query('eliminado') eliminado: boolean,
        @Query('idcliente') idcliente: number,
        @Query('idgrupo') idgrupo: number[] | number,
        @Query('idservicio') idservicio: number[] | number,
        @Query('fechainiciosuscripcion') fechainiciosuscripcion: string,
        @Query('fechafinsuscripcion') fechafinsuscripcion: string,
        @Query('estado') estado: string[] | string,
        @Query('cuotaspendientesdesde') cuotaspendientesdesde: number,
        @Query('cuotaspendienteshasta') cuotaspendienteshasta: number,
        @Query('iddepartamento') iddepartamento: number | number[],
        @Query('iddistrito') iddistrito: number | number[],
        @Query('idbarrio') idbarrio: number | number[],
        @Query('search') search: string
    ): Promise<ServerResponseList<ResumenCantMonto>> {
        try {
            const rows: ResumenCantMonto[] = await this.suscripcionesSrv.getResumenSuscEstados(
                {
                    eliminado,
                    idcliente,
                    idgrupo,
                    idservicio,
                    fechainiciosuscripcion,
                    fechafinsuscripcion,
                    estado,
                    cuotaspendientesdesde,
                    cuotaspendienteshasta,
                    iddepartamento,
                    iddistrito,
                    idbarrio,
                    search
                }
            );
            return new ServerResponseList(rows, rows.length);
        } catch (e) {
            console.log('Error al consultar resumen por estado');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('resumen/gruposservicios')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    async getResumenGruposServicios(
        @Query('eliminado') eliminado: boolean,
        @Query('idcliente') idcliente: number,
        @Query('idgrupo') idgrupo: number[] | number,
        @Query('idservicio') idservicio: number[] | number,
        @Query('fechainiciosuscripcion') fechainiciosuscripcion: string,
        @Query('fechafinsuscripcion') fechafinsuscripcion: string,
        @Query('estado') estado: string[] | string,
        @Query('cuotaspendientesdesde') cuotaspendientesdesde: number,
        @Query('cuotaspendienteshasta') cuotaspendienteshasta: number,
        @Query('iddepartamento') iddepartamento: number | number[],
        @Query('iddistrito') iddistrito: number | number[],
        @Query('idbarrio') idbarrio: number | number[],
        @Query('search') search: string
    ): Promise<ServerResponseList<ResumenCantMonto>> {
        try {
            const rows: ResumenCantMonto[] = await this.suscripcionesSrv.getResumenGruposServicios(
                {
                    eliminado,
                    idcliente,
                    idgrupo,
                    idservicio,
                    fechainiciosuscripcion,
                    fechafinsuscripcion,
                    estado,
                    cuotaspendientesdesde,
                    cuotaspendienteshasta,
                    iddepartamento,
                    iddistrito,
                    idbarrio,
                    search
                }
            );
            return new ServerResponseList(rows, rows.length);
        } catch (e) {
            console.log('Error al consultar resumen por grupos y servicios');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('resumen/departamentosdistritos')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARSUSCRIPCIONES)
    async getResumenDepartamentosDistritos(
        @Query('eliminado') eliminado: boolean,
        @Query('idcliente') idcliente: number,
        @Query('idgrupo') idgrupo: number[] | number,
        @Query('idservicio') idservicio: number[] | number,
        @Query('fechainiciosuscripcion') fechainiciosuscripcion: string,
        @Query('fechafinsuscripcion') fechafinsuscripcion: string,
        @Query('estado') estado: string[] | string,
        @Query('cuotaspendientesdesde') cuotaspendientesdesde: number,
        @Query('cuotaspendienteshasta') cuotaspendienteshasta: number,
        @Query('iddepartamento') iddepartamento: number | number[],
        @Query('iddistrito') iddistrito: number | number[],
        @Query('idbarrio') idbarrio: number | number[],
        @Query('search') search: string
    ): Promise<ServerResponseList<ResumenCantMonto>> {
        try {
            const rows: ResumenCantMonto[] = await this.suscripcionesSrv.getResumenDepartamentosDistritos(
                {
                    eliminado,
                    idcliente,
                    idgrupo,
                    idservicio,
                    fechainiciosuscripcion,
                    fechafinsuscripcion,
                    estado,
                    cuotaspendientesdesde,
                    cuotaspendienteshasta,
                    iddepartamento,
                    iddistrito,
                    idbarrio,
                    search
                }
            );
            return new ServerResponseList(rows, rows.length);
        } catch (e) {
            console.log('Error al consultar resumen por departamentos y distritos');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
