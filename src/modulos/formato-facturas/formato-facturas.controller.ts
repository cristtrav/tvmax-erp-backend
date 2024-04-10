import { Permissions } from '@auth/permission.list';
import { FormatoFactura } from '@database/entity/formato-factura.entity';
import { FormatoFacturaDTO } from 'src/global/dto/formato-factura.dto';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { FormatoFacturasService } from './formato-facturas.service';
import { LoginGuard } from '@auth/guards/login.guard';

@Controller('formatosfacturas')
@UseGuards(LoginGuard)
@UseFilters(HttpExceptionFilter)
export class FormatoFacturasController {

    constructor(
        private formatoFacturaSrv: FormatoFacturasService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<FormatoFactura[]> {
        return this.formatoFacturaSrv.findAll(queries);
    }

    @Get('total')
    count(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.formatoFacturaSrv.count(queries)
    }

    @Get(':id')
    findById(
        @Param('id') idformato: number
    ): Promise<FormatoFactura> {
        return this.formatoFacturaSrv.findById(idformato);
    }

    @Post()
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
    async delete(
        @Param('id') idformato: number,
        @Headers('authorization') auth: string
    ) {
        await this.formatoFacturaSrv.delete(idformato, this.jwtUtils.extractJwtSub(auth));
    }
}
