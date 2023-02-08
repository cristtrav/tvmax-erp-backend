import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { VentaDTO } from '@dto/venta.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Param, Post, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { Request } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DetalleVentaDTO } from '@dto/detalle-venta-dto';
import { DetallesVentasService } from './detalles-ventas/detalles-ventas.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { VentaView } from '@database/view/venta.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { DetalleVentaView } from '@database/view/detalle-venta.view';

@Controller('ventas')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class VentasController {

    constructor(
        private ventasSrv: VentasService,
        private detallesVentaSrv: DetallesVentasService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get('count')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    async countVentas(
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
            return await this.ventasSrv.count(
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
                    idusuarioregistrocobro,
                }
            );
        }catch(e){
            console.log('Error al obtener total de facturas venta');
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
    @RequirePermission(Permissions.VENTAS.REGISTRAR)
    async create(
        @Body() fv: VentaDTO,
        @Headers('authorization') auth: string
    ): Promise<number>{
        return this.ventasSrv.create(
            DTOEntityUtis.ventaDtoToEntity(fv),
            fv.detalles.map(dv => DTOEntityUtis.detalleVentaDtoToEntity(dv)),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Get('total')
    @RequirePermission(Permissions.VENTAS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.ventasSrv.count(queries);
    }

    @Get()
    @RequirePermission(Permissions.VENTAS.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<VentaView[]>{
        return this.ventasSrv.findAll(queries);
    }

    @Get(':id/anular')
    @RequirePermission(Permissions.VENTAS.ANULAR)
    async anular(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.ventasSrv.anular(id, true, this.jwtUtil.extractJwtSub(auth));        
    }

    @Get(':id/revertiranulacion')
    @RequirePermission(Permissions.VENTAS.REVERTIRANUL)
    async revertiranul(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.ventasSrv.anular(id, false, this.jwtUtil.extractJwtSub(auth));
    }

    @Get(':id/detalles')
    @RequirePermission(Permissions.VENTAS.CONSULTAR)
    async getDetallesByIdventa(
        @Param('id') id: number
    ): Promise<DetalleVentaView[]>{
        return this.detallesVentaSrv.findByIdVenta(id);
        /*try{
            const rows: DetalleVentaDTO[] = await this.detallesVentaSrv.findByIdVenta(id);
            const count: number = await this.detallesVentaSrv.countByIdVenta(id);
            return new ServerResponseList(rows, count)
        }catch(e){
            console.log('Error al consultar detalles de venta');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }*/
    }

    @Get(':id/detalles/total')
    @RequirePermission(Permissions.VENTAS.CONSULTAR)
    countByIdventa(
        @Param('id') idventa: number
    ): Promise<number>{
        return this.detallesVentaSrv.countByIdVenta(idventa);
    }

    @Delete(':id')
    @RequirePermission(Permissions.VENTAS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.ventasSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

    @Get(':id')
    @RequirePermission(Permissions.VENTAS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ){
        return this.ventasSrv.findById(id);        
    }

    

}
