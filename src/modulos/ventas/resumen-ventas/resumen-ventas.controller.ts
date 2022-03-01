import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { ResumenCantMonto } from '@dto/resumen-cant-monto.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ResumenVentasService } from './resumen-ventas.service';

@Controller('ventas/resumen')
@UseGuards(AuthGuard)
export class ResumenVentasController {

    constructor(
        private resventasSrv: ResumenVentasService
    ){}

    @Get('gruposservicios')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('search') search: string,
        @Query('fechainiciofactura') fechainiciofactura: string,
        @Query('fechafinfactura') fechafinfactura: string,
        @Query('pagado') pagado: boolean,
        @Query('anulado') anulado: boolean,
        @Query('idcobradorcomision') idcobradorcomision: number,
        @Query('idusuarioregistrocobro') idusuarioregistrocobro: number,
        @Query('fechainiciocobro') fechainiciocobro: string,
        @Query('fechafincobro') fechafincobro: string
    ): Promise<ServerResponseList<ResumenCantMonto>>{
        try{
            const rows: ResumenCantMonto[] =  await this.resventasSrv.getResumenGruposServicios(
                {
                    eliminado,
                    search,
                    fechainiciofactura,
                    fechafinfactura,
                    fechainiciocobro,
                    fechafincobro,
                    pagado,
                    anulado,
                    idcobradorcomision,
                    idusuarioregistrocobro
                }
            );
            return new ServerResponseList(rows, rows.length);
        }catch(e){
            console.log('Error al consultar resumen de ventas por grupo-servicio');
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

    @Get('cobradores')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    async getResumenCobradores(
        @Query('eliminado') eliminado: boolean,
        @Query('search') search: string,
        @Query('fechainiciofactura') fechainiciofactura: string,
        @Query('fechafinfactura') fechafinfactura: string,
        @Query('pagado') pagado: boolean,
        @Query('anulado') anulado: boolean,
        @Query('idcobradorcomision') idcobradorcomision: number,
        @Query('idusuarioregistrocobro') idusuarioregistrocobro: number,
        @Query('fechainiciocobro') fechainiciocobro: string,
        @Query('fechafincobro') fechafincobro: string
    ): Promise<ServerResponseList<ResumenCantMonto>>{
        try{
            const rows: ResumenCantMonto[] =  await this.resventasSrv.getResumenCobradores(
                {
                    eliminado,
                    search,
                    fechainiciofactura,
                    fechafinfactura,
                    fechainiciocobro,
                    fechafincobro,
                    pagado,
                    anulado,
                    idcobradorcomision,
                    idusuarioregistrocobro
                }
            );
            return new ServerResponseList(rows, rows.length);
        }catch(e){
            console.log('Error al consultar resumen de ventas por cobrador');
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

    @Get('montototal')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    async getMontoTotal(
        @Query('eliminado') eliminado: boolean,
        @Query('search') search: string,
        @Query('fechainiciofactura') fechainiciofactura: string,
        @Query('fechafinfactura') fechafinfactura: string,
        @Query('pagado') pagado: boolean,
        @Query('anulado') anulado: boolean,
        @Query('idcobradorcomision') idcobradorcomision: number,
        @Query('idusuarioregistrocobro') idusuarioregistrocobro: number,
        @Query('fechainiciocobro') fechainiciocobro: string,
        @Query('fechafincobro') fechafincobro: string
    ): Promise<number>{
        try{
            return await this.resventasSrv.getMontoTotal(
                {
                    eliminado,
                    search,
                    fechainiciofactura,
                    fechafinfactura,
                    fechainiciocobro,
                    fechafincobro,
                    pagado,
                    anulado,
                    idcobradorcomision,
                    idusuarioregistrocobro
                }
            );
        }catch(e){
            console.log('Error al consultar monto total de facturas');
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
