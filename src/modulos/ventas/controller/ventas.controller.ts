import { Permissions } from '@auth/permission.list';
import { Body, Controller, Delete, Get, Header, Headers, Param, Post, Put, Query, StreamableFile, UseFilters, UseGuards } from '@nestjs/common';
import { VentasService } from '../service/ventas.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DetallesVentasService } from '../service/detalles-ventas.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { VentaView } from '@database/view/venta.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { LoginGuard } from '@auth/guards/login.guard';
import { FacturaElectronicaService } from '@modulos/facturacion/factura-electronica/services/factura-electronica.service';
import { FacturaElectronicaUtilsService } from '../service/factura-electronica-utils.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { VentaDTO } from '@dto/venta.dto';
import { FacturaElectronicaView } from '@database/view/facturacion/factura-electronica.view';

@Controller('ventas')
@UseGuards(LoginGuard)
@UseFilters(HttpExceptionFilter)
export class VentasController {

    constructor(
        private ventasSrv: VentasService,
        private detallesVentaSrv: DetallesVentasService,
        private facturaElectronicaSrv: FacturaElectronicaService,
        private facturaElectronicaUtilsSrv: FacturaElectronicaUtilsService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get('count')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    countVentas(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.ventasSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.VENTAS.REGISTRAR)
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
    @AllowedIn(Permissions.VENTAS.EDITAR)
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
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.ventasSrv.count(queries);
    }

    @Get()
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<VentaView[]>{
        return this.ventasSrv.findAll(queries);
    }

    @Get(':id/anular')
    @AllowedIn(Permissions.VENTAS.ANULAR)
    async anular(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.ventasSrv.anular(id, true, this.jwtUtil.extractJwtSub(auth));        
    }

    @Get(':id/revertiranulacion')
    @AllowedIn(Permissions.VENTAS.REVERTIRANUL)
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

    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    @Get(':id/detalles/total')    
    countByIdventa(
        @Param('id') idventa: number
    ): Promise<number>{
        return this.detallesVentaSrv.countByIdVenta(idventa);
    }

    @Delete(':id')
    @AllowedIn(Permissions.VENTAS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.ventasSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

    @Get(':id')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ){
        return this.ventasSrv.findById(id);        
    }

    @Get(':id/dte')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    @Header('content-type', 'text/xml')
    async getDTEById(
        @Param('id') id: number
    ): Promise<StreamableFile>{
        const factElectronica = await this.facturaElectronicaSrv.findById(id);
        return new StreamableFile(Buffer.from(factElectronica.documentoElectronico, 'utf-8'));
    }

    @Get(':id/kude')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    @Header('content-type', 'application/pdf')
    async getKUDEById(
        @Param('id') id: number
    ): Promise<StreamableFile>{
        return await this.facturaElectronicaUtilsSrv.generateKude(await this.facturaElectronicaSrv.findById(id));
    }

    @Get(':idventa/facturaelectronica')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    findDetailsById(
        @Param('idventa') idventa: number
    ): Promise<FacturaElectronicaView> {
        return this.facturaElectronicaSrv.findDetailsById(idventa);
    }
}
