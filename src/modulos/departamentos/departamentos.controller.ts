import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../../global/auth/auth.guard';
import { Permissions } from '../../global/auth/permission.list';
import { RequirePermission } from '../../global/auth/require-permission.decorator';
import { DepartamentosService } from './departamentos.service';
import { JwtService } from '@nestjs/jwt';
import { Departamento } from '@database/entity/departamento.entity';
import { DepartamentoDTO } from '@dto/departamento.dto';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { HttpExceptionFilter } from 'src/global/filters/http-exception.filter';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Controller('departamentos')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class DepartamentosController {

    constructor(
        private departamentoSrv: DepartamentosService,
        private jwtSrv: JwtService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.DEPARTAMENTOS.CONSULTAR)
    async findAll(
        @Query() queries: { [name: string]: any }
    ): Promise<Departamento[]> {
        return this.departamentoSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.DEPARTAMENTOS.CONSULTAR)
    async count(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.departamentoSrv.count(queries);
    }

    @Post()
    @RequirePermission(Permissions.DEPARTAMENTOS.REGISTRAR)
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
    @RequirePermission(Permissions.DEPARTAMENTOS.EDITAR)
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
    @RequirePermission(Permissions.DEPARTAMENTOS.CONSULTAR)
    async findById(
        @Param('id') id: string
    ): Promise<Departamento> {
        return this.departamentoSrv.findById(id);
    }

    @Delete(':id')
    @RequirePermission(Permissions.DEPARTAMENTOS.ELIMINAR)
    async delete(
        @Param('id') id: string,
        @Headers('authorization') auth: string
    ): Promise<any> {
        await this.departamentoSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
}
