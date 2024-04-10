import { Permissions } from '@auth/permission.list';
import { VentaDTO } from 'src/global/dto/venta.dto';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DetallesVentasService } from './detalles-ventas/detalles-ventas.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { VentaView } from '@database/view/venta.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { LoginGuard } from '@auth/guards/login.guard';

@Controller('ventas')
@UseGuards(LoginGuard)
@UseFilters(HttpExceptionFilter)
export class VentasController {

    constructor(
        private ventasSrv: VentasService,
        private detallesVentaSrv: DetallesVentasService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get('count')
    countVentas(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.ventasSrv.count(queries);
    }

    @Post()    
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

    @Put()
    async edit(
        @Body() fv: VentaDTO,
        @Headers('authorization') auth: string
    ){
        await this.ventasSrv.edit(
            DTOEntityUtis.ventaDtoToEntity(fv),
            fv.detalles.map(dv => DTOEntityUtis.detalleVentaDtoToEntity(dv)),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Get('total')
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.ventasSrv.count(queries);
    }

    @Get()
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<VentaView[]>{
        return this.ventasSrv.findAll(queries);
    }

    @Get(':id/anular')
    async anular(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.ventasSrv.anular(id, true, this.jwtUtil.extractJwtSub(auth));        
    }

    @Get(':id/revertiranulacion')
    async revertiranul(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.ventasSrv.anular(id, false, this.jwtUtil.extractJwtSub(auth));
    }

    @Get(':id/detalles')
    async getDetallesByIdventa(
        @Param('id') id: number
    ): Promise<DetalleVentaView[]>{
        return this.detallesVentaSrv.findByIdVenta(id);
    }

    @Get(':id/detalles/total')    
    countByIdventa(
        @Param('id') idventa: number
    ): Promise<number>{
        return this.detallesVentaSrv.countByIdVenta(idventa);
    }

    @Delete(':id')    
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.ventasSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

    @Get(':id')    
    async findById(
        @Param('id') id: number
    ){
        return this.ventasSrv.findById(id);        
    }
}
