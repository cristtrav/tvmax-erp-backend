import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { CodigoSeguridadContribuyenteService } from './codigo-seguridad-contribuyente.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { CodigoSeguridadContribuyenteDTO } from '@dto/facturacion/codigo-seguridad-contribuyente.dto';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('csc')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class CodigoSerguridadContribuyenteController {

    constructor(
        private cscSrv: CodigoSeguridadContribuyenteService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(Permissions.CODIGOSEGURIDADCONTRIBUYENTE.CONSULTAR)
    async findAll(
        @Query() queries: QueriesType
    ): Promise<CodigoSeguridadContribuyenteDTO[]>{
        return (await this.cscSrv.findAll(queries)).map(csc => {
            return {
                id: csc.id,
                codigoseguridad: csc.codigoSeguridad,
                activo: csc.activo
            }
        });
    }

    @Get('count')
    @AllowedIn(Permissions.CODIGOSEGURIDADCONTRIBUYENTE.CONSULTAR)
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.cscSrv.count(queries);
    }

    @Get(':id')
    @AllowedIn(Permissions.CODIGOSEGURIDADCONTRIBUYENTE.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<CodigoSeguridadContribuyenteDTO>{
        const csc = await this.cscSrv.findById(id);
        return {
            id: csc.id,
            codigoseguridad: csc.codigoSeguridad,
            activo: csc.activo
        }
    }

    @Post()
    @AllowedIn(Permissions.CODIGOSEGURIDADCONTRIBUYENTE.REGISTRAR)
    async create(
        @Body() cscDto: CodigoSeguridadContribuyenteDTO,
        @Headers('authorization') auth: string
    ){
        await this.cscSrv.create(
            new CodigoSeguridadContribuyente().fromDTO(cscDto),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @AllowedIn(Permissions.CODIGOSEGURIDADCONTRIBUYENTE.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() cscDto: CodigoSeguridadContribuyenteDTO,
        @Headers('authorization') auth: string
    ){
        await this.cscSrv.edit(
            oldId,
            new CodigoSeguridadContribuyente().fromDTO(cscDto),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @AllowedIn(Permissions.CODIGOSEGURIDADCONTRIBUYENTE.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.cscSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
}

type QueriesType = {[name: string]: any}
