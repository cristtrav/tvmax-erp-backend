import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { VentaDTO } from '@dto/venta.dto';
import { Body, Controller, Delete, Get, Headers, Param, Post, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
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
    countVentas(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.ventasSrv.count(queries);
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
