import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { FacturaVenta } from '@dto/factura-venta.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { Request } from '@nestjs/common';
import { JwtUtilsService } from '@util/jwt-utils/jwt-utils.service';

@Controller('ventas')
@UseGuards(AuthGuard)
export class VentasController {

    constructor(
        private ventasSrv: VentasService,
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
        @Body() fv: FacturaVenta,
        @Req() request: Request
    ): Promise<number>{
        try{
            return await this.ventasSrv.create(fv, true, this.jwtUtil.decodeIdUsuario(request));
        }catch(e){
            console.log('Error al registrar venta')
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

    @Get()
    @RequirePermission(Permissions.VENTAS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Query('fechainiciofactura') fechainiciofactura: string,
        @Query('fechafinfactura') fechafinfactura: string,
        @Query('pagado') pagado: boolean,
        @Query('anulado') anulado: boolean,
        @Query('idcobradorcomision') idcobradorcomision: number,
        @Query('idusuarioregistrocobro') idusuarioregistrocobro: number,
        @Query('fechainiciocobro') fechainiciocobro: string,
        @Query('fechafincobro') fechafincobro: string
    ): Promise<ServerResponseList<FacturaVenta>>{
        try{
            const data: FacturaVenta[] = await this.ventasSrv.findAll(
                {
                    eliminado,
                    search,
                    fechainiciofactura,
                    fechafinfactura,
                    pagado,
                    anulado,
                    idcobradorcomision,
                    idusuarioregistrocobro,
                    fechainiciocobro,
                    fechafincobro,
                    sort,
                    offset,
                    limit
                }
            );
            const count: number = await this.ventasSrv.count(
                {
                    eliminado,
                    search,
                    fechainiciofactura,
                    fechafinfactura,
                    pagado,
                    anulado,
                    idcobradorcomision,
                    idusuarioregistrocobro,
                    fechainiciocobro,
                    fechafincobro,
                }
            );
            return new ServerResponseList<FacturaVenta>(data, count);
        }catch(e){
            console.log('Error al consultar facturas de venta');
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

    @Get(':id/anular')
    @RequirePermission(Permissions.VENTAS.ANULAR)
    async anular(
        @Param('id') id: number,
        @Req() request: Request
    ){
        try{
            await this.ventasSrv.anular(id, true, this.jwtUtil.decodeIdUsuario(request));
        }catch(e){
            console.log('Error al anular venta');
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

    @Get(':id/revertiranulacion')
    @RequirePermission(Permissions.VENTAS.REVERTIRANUL)
    async revertiranul(
        @Param('id') id: number,
        @Req() request: Request
    ){
        try{
            await this.ventasSrv.anular(id, false, this.jwtUtil.decodeIdUsuario(request));
        }catch(e){
            console.log('Error al revertir anulacion');
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

    @Delete(':id')
    @RequirePermission(Permissions.VENTAS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Req() request: Request
    ){
        try{
            if(!await this.ventasSrv.delete(id, this.jwtUtil.decodeIdUsuario(request))){
                throw new HttpException(
                    {
                        request: 'delete',
                        description: `No se encontr?? la factura con ??odigo ${id}`
                    },
                    HttpStatus.NOT_FOUND
                );
            }
        }catch(e){
            console.log('Error al eliminar factura venta');
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

    @Get(':id')
    @RequirePermission(Permissions.VENTAS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ){
        try{
            const rows: FacturaVenta = await this.ventasSrv.findById(id);
            if(!rows) throw new HttpException(
                {
                    request: 'get',
                    description: `No se encontr?? la venta con c??digo ${id}`
                },
                HttpStatus.NOT_FOUND
            );
            return rows;
        }catch(e){
            console.log('Error al consultar factura venta por id');
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
