import { Request, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { SuscripcionesService } from './suscripciones.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';
import { Suscripcion } from '../../dto/suscripcion.dto';
import { CuotasService } from '../cuotas/cuotas.service';
import { Cuota } from '@dto/cuota.dto';
import { Servicio } from '@dto/servicio.dto';
import { ServiciosService } from '../servicios/servicios.service'
import { ResumenCantMonto } from '@dto/resumen-cant-monto.dto';
import { JwtUtilsService } from '@util/jwt-utils/jwt-utils.service';

@Controller('suscripciones')
@UseGuards(AuthGuard)
export class SuscripcionesController {

    constructor(
        private suscripcionesSrv: SuscripcionesService,
        private cuotasSrv: CuotasService,
        private serviciosSrv: ServiciosService,
        private jwtUtil: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
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
    ): Promise<ServerResponseList<Suscripcion>> {
        try {
            const rows: Suscripcion[] = await this.suscripcionesSrv.findAll(
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
                    search,
                    sort,
                    offset,
                    limit
                }
            );
            const rowCount: number = await this.suscripcionesSrv.count(
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
            return new ServerResponseList<Suscripcion>(rows, rowCount);
        } catch (e) {
            console.log('Error al consultar Suscripciones');
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

    @Get('ultimoid')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    async getLastId(
    ): Promise<number> {
        try {
            return await this.suscripcionesSrv.getLastId();
        } catch (e) {
            console.log('Error al consultar ultimo id');
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

    @Get('count')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONTAR)
    async count(
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
    ): Promise<number>{
        try{
            return await(this.suscripcionesSrv.count(
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
            ));
        }catch(e){
            console.log('Error al contar total de suscripciones');
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

    @Post()
    @RequirePermission(Permissions.SUSCRIPCIONES.REGISTRAR)
    async create(
        @Body() s: Suscripcion,
        @Req() request: Request
    ) {
        try {
            await this.suscripcionesSrv.create(s, this.jwtUtil.decodeIdUsuario(request));
        } catch (e) {
            console.log('Error al registrar')
            console.log(e);
            throw new HttpException(
                {
                    request: 'post',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':id')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<Suscripcion> {
        try {
            const s: Suscripcion = await this.suscripcionesSrv.findById(id);
            if (!s) throw new HttpException(
                {
                    request: 'get',
                    description: `No se encontr?? la suscripci??n con c??digo ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
            return s;
        } catch (e) {
            console.log('Error al consultar suscripcion por ID');
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

    @Put(':id')
    @RequirePermission(Permissions.SUSCRIPCIONES.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() s: Suscripcion,
        @Req() request: Request
    ) {
        try {
            if (!(await this.suscripcionesSrv.edit(oldId, s, this.jwtUtil.decodeIdUsuario(request)))) throw new HttpException(
                {
                    request: 'put',
                    description: `No se encontr?? la suscripci??n con c??digo ${oldId}.`
                },
                HttpStatus.NOT_FOUND
            );
        } catch (e) {
            console.log('Error al editar suscripcion');
            console.log(e);
            throw new HttpException(
                {
                    request: 'put',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(':id')
    @RequirePermission(Permissions.SUSCRIPCIONES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Req() request: Request
    ) {
        try {
            if (!(await this.suscripcionesSrv.delete(id, this.jwtUtil.decodeIdUsuario(request)))) throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontr?? la suscripci??n con c??digo ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
        } catch (e) {
            console.log('Error al eliminar suscripcion');
            console.log(e);
            throw new HttpException(
                {
                    request: 'delete',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':id/cuotas')
    @RequirePermission(Permissions.CUOTAS.CONSULTAR)
    async getCuotasBySuscripcion(
        @Param('id') idsusc: number,
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<Cuota>>{
        try{
            const data: Cuota[] = await this.cuotasSrv.getCuotasPorSuscripcion(idsusc, {eliminado, sort, offset, limit});
            const count: number = await this.cuotasSrv.countCuotasPorSuscripcion(idsusc, {eliminado});
            const sr: ServerResponseList<Cuota> = new ServerResponseList<Cuota>(data, count);
            return sr;
        }catch(e){
            console.log('Error al consultar cuotas por suscripcion');
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

    @Get(':id/cuotas/servicios')
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    async getServiciosByCuotas(
        @Param('id') idsusc: number,
        @Query('eliminado') eliminado: boolean,
        @Query('pagado') pagado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<Servicio>>{
        try{
            const data: Servicio[] = await this.serviciosSrv.getServiciosEnCuotas(idsusc, {eliminado, pagado,sort, offset, limit});
            const count: number = await this.serviciosSrv.countServiciosEnCuotas(idsusc, {eliminado, pagado});
            return new ServerResponseList<Servicio>(data, count); 
        }catch(e){
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
    ): Promise<ServerResponseList<ResumenCantMonto>>{
        try{
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
        }catch(e){
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
    ): Promise<ServerResponseList<ResumenCantMonto>>{
        try{
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
        }catch(e){
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
    ): Promise<ServerResponseList<ResumenCantMonto>>{
        try{
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
        }catch(e){
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
    ): Promise<ServerResponseList<ResumenCantMonto>>{
        try{
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
        }catch(e){
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
