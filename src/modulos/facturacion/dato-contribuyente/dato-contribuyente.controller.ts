import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Get, Headers, Post, UseFilters, UseGuards } from '@nestjs/common';
import { DatoContribuyenteService } from './dato-contribuyente.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Controller('datoscontribuyente')
//@UseGuards(LoginGuard)
//@UseFilters(HttpExceptionFilter)
export class DatoContribuyenteController {

    constructor(
        private datoContribuyenteSrv: DatoContribuyenteService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    async findAll(): Promise<DatoContribuyente[]>{
        return this.datoContribuyenteSrv.findAll();
    }

    @Post()
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
