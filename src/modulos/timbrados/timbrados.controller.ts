import { Permissions } from '@auth/permission.list';
import { TimbradoDTO } from 'src/global/dto/timbrado.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { TimbradosService } from './timbrados.service';
import { TimbradoView } from '@database/view/timbrado.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { FormatoFactura } from '@database/entity/formato-factura.entity';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('timbrados')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class TimbradosController {

    constructor(
        private timbradosSrv: TimbradosService,
        private jwtUtil: JwtUtilsService
    ) { }

    @Post()
    @AllowedIn(Permissions.TIMBRADOS.REGISTRAR)
    async create(
        @Body() t: TimbradoDTO,
        @Headers('authorization') auth: string
        
    ) {
        await this.timbradosSrv.create(
            DTOEntityUtis.timbradoDtoToEntity(t),
            this.jwtUtil.extractJwtSub(auth)
        )
    }

    @Get()
    @AllowedIn(
        Permissions.TIMBRADOS.CONSULTAR,
        Permissions.POS.ACCESOMODULO
    )
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<TimbradoView[]> {
        return this.timbradosSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.TIMBRADOS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.timbradosSrv.count(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.TIMBRADOS.ACCESOFORMULARIO)
    getLastId(): Promise<number>
    {
        return this.timbradosSrv.getLastId();
    }

    @Get(':id/formatoimpresion')
    @AllowedIn(Permissions.POS.ACCESOMODULO)
    findFormatoByIdtimbrado(
        @Param('id') idtimbrado: number
    ): Promise<FormatoFactura>{
        return this.timbradosSrv.findFormatoByIdtimbrado(idtimbrado)
    }

    @Get(':id')
    @AllowedIn(
        Permissions.TIMBRADOS.ACCESOFORMULARIO,
        Permissions.POS.ACCESOMODULO
    )
    async findById(
        @Param('id') id: number
    ): Promise<TimbradoView> {
        return this.timbradosSrv.findById(id);
    }

    @Put(':id')
    @AllowedIn(Permissions.TIMBRADOS.EDITAR)
    async edit(
        @Param('id') oldid: number,
        @Body() t: TimbradoDTO,
        @Headers('authorization') auth: string
    ) {
        await this.timbradosSrv.edit(
            oldid,
            DTOEntityUtis.timbradoDtoToEntity(t),
            this.jwtUtil.extractJwtSub(auth)
        )
    }

    @Delete(':id')
    @AllowedIn(Permissions.TIMBRADOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.timbradosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }
}
