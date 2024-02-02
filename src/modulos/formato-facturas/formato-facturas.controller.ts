import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { FormatoFactura } from '@database/entity/formato-factura.entity';
import { FormatoFacturaDTO } from 'src/global/dto/formato-factura.dto';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { FormatoFacturasService } from './formato-facturas.service';

@Controller('formatosfacturas')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class FormatoFacturasController {

    constructor(
        private formatoFacturaSrv: FormatoFacturasService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.FORMATOFACTURA.CONSULTAR)
    findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<FormatoFactura[]> {
        return this.formatoFacturaSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.FORMATOFACTURA.CONSULTAR)
    count(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.formatoFacturaSrv.count(queries)
    }

    @Get(':id')
    @RequirePermission(Permissions.FORMATOFACTURA.CONSULTAR)
    findById(
        @Param('id') idformato: number
    ): Promise<FormatoFactura> {
        return this.formatoFacturaSrv.findById(idformato);
    }

    @Post()
    @RequirePermission(Permissions.FORMATOFACTURA.REGISTRAR)
    async create(
        @Body() formato: FormatoFacturaDTO,
        @Headers('authorization') auth: string
    ) {
        await this.formatoFacturaSrv.create(
            DTOEntityUtis.formatoFacturaDtoToEntity(formato),
            this.jwtUtils.extractJwtSub(auth)
        )
    }

    @Put(':id')
    @RequirePermission(Permissions.FORMATOFACTURA.EDITAR)
    async edit(
        @Param('id') idformato: number,
        @Body() formato: FormatoFacturaDTO,
        @Headers('authorization') auth: string
    ) {
        await this.formatoFacturaSrv.edit(
            idformato,
            DTOEntityUtis.formatoFacturaDtoToEntity(formato),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @RequirePermission(Permissions.FORMATOFACTURA.ELIMINAR)
    async delete(
        @Param('id') idformato: number,
        @Headers('authorization') auth: string
    ) {
        await this.formatoFacturaSrv.delete(idformato, this.jwtUtils.extractJwtSub(auth));
    }
}
