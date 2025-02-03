import { Permissions } from '@auth/permission.list';
import { TalonarioDTO } from '@dto/talonario.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { TalonariosService } from './talonarios.service';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { FormatoFactura } from '@database/entity/formato-factura.entity';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Talonario } from '@database/entity/facturacion/talonario.entity';

@Controller('talonarios')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class TalonariosController {

    constructor(
        private talonariosSrv: TalonariosService,
        private jwtUtil: JwtUtilsService
    ) { }

    @Post()
    @AllowedIn(Permissions.TALONARIOS.REGISTRAR)
    async create(
        @Body() t: TalonarioDTO,
        @Headers('authorization') auth: string
        
    ) {
        await this.talonariosSrv.create(
            new Talonario(t),
            this.jwtUtil.extractJwtSub(auth)
        )
    }

    @Get()
    @AllowedIn(
        Permissions.TALONARIOS.CONSULTAR,
        Permissions.POS.ACCESOMODULO,
        Permissions.POSMOVIL.ACCESOMODULO
    )
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<TalonarioView[]> {
        return this.talonariosSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.TALONARIOS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.talonariosSrv.count(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.TALONARIOS.ACCESOFORMULARIO)
    getLastId(): Promise<number>
    {
        return this.talonariosSrv.getLastId();
    }

    @Get(':id/formatoimpresion')
    @AllowedIn(
        Permissions.POS.ACCESOMODULO,
        Permissions.POSMOVIL.ACCESOMODULO
    )
    findFormatoByIdtalonario(
        @Param('id') idtalonario: number
    ): Promise<FormatoFactura>{
        return this.talonariosSrv.findFormatoByIdtalonario(idtalonario)
    }

    @Get(':id')
    @AllowedIn(
        Permissions.TALONARIOS.ACCESOFORMULARIO,
        Permissions.POS.ACCESOMODULO,
        Permissions.POSMOVIL.ACCESOMODULO
    )
    async findById(
        @Param('id') id: number
    ): Promise<TalonarioView> {
        return this.talonariosSrv.findById(id);
    }

    @Put(':id')
    @AllowedIn(Permissions.TALONARIOS.EDITAR)
    async edit(
        @Param('id') oldid: number,
        @Body() t: TalonarioDTO,
        @Headers('authorization') auth: string
    ) {
        await this.talonariosSrv.edit(
            oldid,
            new Talonario(t),
            this.jwtUtil.extractJwtSub(auth)
        )
    }

    @Delete(':id')
    @AllowedIn(Permissions.TALONARIOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.talonariosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }
}
