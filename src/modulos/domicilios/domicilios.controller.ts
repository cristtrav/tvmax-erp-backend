import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { DomicilioDTO } from '@dto/domicilio.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DomiciliosService } from './domicilios.service';
import { DomicilioView } from '@database/view/domicilio.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@database/dto-entity-utils';

@Controller('domicilios')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class DomiciliosController {

    constructor(
        private domiciliosSrv: DomiciliosService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.DOMICILIOS.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<DomicilioView[]>{
        return this.domiciliosSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.DOMICILIOS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.domiciliosSrv.count(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.DOMICILIOS.CONSULTAR)
    getLastId(): Promise<number>{
        return this.domiciliosSrv.getLastId();
    }

    @Post()
    @RequirePermission(Permissions.DOMICILIOS.REGISTRAR)
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
    @RequirePermission(Permissions.DOMICILIOS.EDITAR)
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
    @RequirePermission(Permissions.DOMICILIOS.CONSULTAR)
    findById(
        @Param('id') id: number
    ): Promise<DomicilioView> {
        return this.domiciliosSrv.findById(id);
    }

    @Delete(':id')
    @RequirePermission(Permissions.DOMICILIOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.domiciliosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

}
