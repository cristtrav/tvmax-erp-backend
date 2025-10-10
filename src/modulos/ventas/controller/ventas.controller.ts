import { Permissions } from '@auth/permission.list';
import { Body, Controller, Delete, Get, Header, Headers, HttpException, HttpStatus, Param, Post, Put, Query, StreamableFile, UseFilters, UseGuards } from '@nestjs/common';
import { VentasService } from '../service/ventas.service';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { DetallesVentasService } from '../service/detalles-ventas.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { VentaView } from '@database/view/venta.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { LoginGuard } from '@auth/guards/login.guard';
import { FacturaElectronicaService } from '@modulos/facturacion/factura-electronica/services/factura-electronica.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { VentaDTO } from '@dto/venta.dto';
import { DteView } from '@database/view/facturacion/dte.view';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { KudeUtilService } from '@modulos/sifen/sifen-utils/services/kude/kude-util.service';
import { CrearVentaService } from '../service/crear-venta.service';
import { EditarVentaService } from '../service/editar-venta.service';
import { EliminarVentaService } from '../service/eliminar-venta.service';
import { ClientesService } from '@modulos/clientes/service/clientes.service';
import { ExportarVentasService } from '../service/exportar-ventas.service';

@Controller('ventas')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class VentasController {

    constructor(
        private ventasSrv: VentasService,
        private detallesVentaSrv: DetallesVentasService,
        private facturaElectronicaSrv: FacturaElectronicaService,
        private jwtUtil: JwtUtilsService,
        private kudeFacturaUtilSrv: KudeUtilService,
        private crearVentaSrv: CrearVentaService,
        private editarVentaSrv: EditarVentaService,
        private eliminarVentaSrv: EliminarVentaService,
        private clientesSrv: ClientesService,
        private exportarVentasService: ExportarVentasService
    ) { }

    @Get('count')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    countVentas(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.ventasSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.VENTAS.REGISTRAR)
    async create(
        @Body() fv: VentaDTO,
        @Headers('authorization') auth: string
    ): Promise<number> {
        return this.crearVentaSrv.create(
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
    ) {
        await this.editarVentaSrv.edit(
            DTOEntityUtis.ventaDtoToEntity(fv),
            fv.detalles.map(dv => DTOEntityUtis.detalleVentaDtoToEntity(dv)),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Get('total')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    count(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.ventasSrv.count(queries);
    }

    @Get('exportar/xls')
    @AllowedIn(Permissions.VENTAS.EXPORTARXLS)
    async exportarXls(
        @Query() queries: { [name: string ]: any }
    ): Promise<StreamableFile>{
        return this.exportarVentasService.exportarXlsx(queries);
    }

    @Get()
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<VentaView[]> {
        return this.ventasSrv.findAll(queries);
    }

    @Get(':id/detalles')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    async getDetallesByIdventa(
        @Param('id') id: number
    ): Promise<DetalleVentaView[]> {
        return this.detallesVentaSrv.findByIdVenta(id);
    }

    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    @Get(':id/detalles/total')
    countByIdventa(
        @Param('id') idventa: number
    ): Promise<number> {
        return this.detallesVentaSrv.countByIdVenta(idventa);
    }

    @Delete(':id')
    @AllowedIn(Permissions.VENTAS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.eliminarVentaSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

    @Get(':id')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ) {
        return this.ventasSrv.findById(id);
    }

    @Get(':id/dte')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    @Header('content-type', 'text/xml')
    async getDTEById(
        @Param('id') id: number
    ): Promise<StreamableFile> {
        const venta = await this.ventasSrv.findById(id);
        if(venta.iddte == null) throw new HttpException({
            message: 'La venta no tiene una factura electrónica asociada'
        }, HttpStatus.NOT_FOUND);
        const factElectronica = await this.facturaElectronicaSrv.findById(venta.iddte);
        return new StreamableFile(Buffer.from(factElectronica.xml, 'utf-8'));
    }

    @Get(':id/kude')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    @Header('content-type', 'application/pdf')
    async getKUDEById(
        @Param('id') id: number,
        @Query('duplicado') duplicado: string
    ): Promise<StreamableFile> {
        const venta = await this.ventasSrv.findById(id);
        if(venta.iddte == null) throw new HttpException({
            message: 'La venta no tiene una factura electrónica asociada'
        }, HttpStatus.NOT_FOUND);
        const cliente = await this.clientesSrv.findById(venta.idcliente);        
        return await this.kudeFacturaUtilSrv.generateKude(
            await this.facturaElectronicaSrv.findById(venta.iddte),
            duplicado == 'true',
            cliente.direccion
        );
    }

    @Get(':idventa/facturaelectronica')
    @AllowedIn(Permissions.VENTAS.CONSULTAR)
    findDetailsById(
        @Param('idventa') idventa: number
    ): Promise<DteView> {        
        return this.facturaElectronicaSrv.findDetailsById(idventa);
    }

    @Get(':idventa/consultarsifen')
    @AllowedIn(Permissions.VENTAS.SINCRONIZARSIFEN)
    async consultarFacturasifen(
        @Param('idventa') idventa: number
    ) {
        await this.ventasSrv.consultarFacturaSifen(idventa);
        return { resultado: 'ok' };
    }
}
