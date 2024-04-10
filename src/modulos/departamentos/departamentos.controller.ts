import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { JwtService } from '@nestjs/jwt';
import { Departamento } from '@database/entity/departamento.entity';
import { DepartamentoDTO } from 'src/global/dto/departamento.dto';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { HttpExceptionFilter } from 'src/global/filters/http-exception.filter';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('departamentos')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class DepartamentosController {

    constructor(
        private departamentoSrv: DepartamentosService,
        private jwtSrv: JwtService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @AllowedIn(
        Permissions.DEPARTAMENTOS.CONSULTAR,
        Permissions.DISTRITOS.ACCESOMODULO,
        Permissions.DISTRITOS.ACCESOFORMULARIO,
        Permissions.CLIENTES.ACCESOMODULO,
        Permissions.SUSCRIPCIONES.ACCESOMODULO
    )
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<Departamento[]> {
        return this.departamentoSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.DEPARTAMENTOS.CONSULTAR)
    async count(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.departamentoSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.DEPARTAMENTOS.REGISTRAR)
    async create(
        @Body() d: DepartamentoDTO,
        @Headers('authorization') auth: string
    ) {
        await this.departamentoSrv.create(
            DTOEntityUtis.departamentoDtoToEntity(d),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @AllowedIn(Permissions.DEPARTAMENTOS.EDITAR)
    async update(
        @Param('id') oldId: string,
        @Body() d: DepartamentoDTO,
        @Headers('authorization') auth: string
    ) {
        await this.departamentoSrv.update(
            oldId, DTOEntityUtis.departamentoDtoToEntity(d),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Get(':id')
    @AllowedIn(Permissions.DEPARTAMENTOS.ACCESOFORMULARIO)
    async findById(
        @Param('id') id: string
    ): Promise<Departamento> {
        return this.departamentoSrv.findById(id);
    }

    @Delete(':id')
    @AllowedIn(Permissions.DEPARTAMENTOS.ELIMINAR)
    async delete(
        @Param('id') id: string,
        @Headers('authorization') auth: string
    ): Promise<any> {
        await this.departamentoSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
}
