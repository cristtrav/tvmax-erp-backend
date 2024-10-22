import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Get, Headers, Post, UseFilters, UseGuards } from '@nestjs/common';
import { DatoContribuyenteService } from './dato-contribuyente.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('datoscontribuyente')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class DatoContribuyenteController {

    constructor(
        private datoContribuyenteSrv: DatoContribuyenteService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(Permissions.DATOSCONTRIBUYENTE.CONSULTAR)
    async findAll(): Promise<DatoContribuyente[]>{
        return this.datoContribuyenteSrv.findAll();
    }

    @Post()
    @AllowedIn(Permissions.DATOSCONTRIBUYENTE.EDITAR)
    async create(
        @Body() datos: DatoContribuyente[],
        @Headers('authorization') auth: string
    ){
        await this.datoContribuyenteSrv.create(
            datos,
            this.jwtUtils.extractJwtSub(auth)
        );
    }

}
