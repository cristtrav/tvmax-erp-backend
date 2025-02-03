import { Permissions } from '@auth/permission.list';
import { DomicilioDTO } from 'src/global/dto/domicilio.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { DomiciliosService } from './domicilios.service';
import { DomicilioView } from '@database/view/domicilio.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('domicilios')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class DomiciliosController {

    constructor(
        private domiciliosSrv: DomiciliosService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(
        Permissions.DOMICILIOS.CONSULTAR,
        Permissions.SUSCRIPCIONES.ACCESOFORMULARIO
    )
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<DomicilioView[]>{
        return this.domiciliosSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.DOMICILIOS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.domiciliosSrv.count(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.DOMICILIOS.ACCESOFORMULARIO)
    getLastId(): Promise<number>{
        return this.domiciliosSrv.getLastId();
    }

    @Post()
    @AllowedIn(Permissions.DOMICILIOS.REGISTRAR)
    async create(
        @Body() d: DomicilioDTO,
        @Headers('authorization') auth: string
    ){
        await this.domiciliosSrv.create(
            DTOEntityUtis.domicilioDtoToEntity(d),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @AllowedIn(Permissions.DOMICILIOS.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() d: DomicilioDTO,
        @Headers('authorization') auth: string
    ){
        await this.domiciliosSrv.edit(
            oldId,
            DTOEntityUtis.domicilioDtoToEntity(d),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Get(':id')
    @AllowedIn(Permissions.DOMICILIOS.ACCESOFORMULARIO)
    findById(
        @Param('id') id: number
    ): Promise<DomicilioView> {
        return this.domiciliosSrv.findById(id);
    }

    @Delete(':id')
    @AllowedIn(Permissions.DOMICILIOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.domiciliosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

}
