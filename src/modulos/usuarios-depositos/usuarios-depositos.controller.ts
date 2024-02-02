import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { UsuariosDepositosService } from './usuarios-depositos.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { UsuarioDepositoView } from '@database/view/depositos/usuario-deposito.view';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { AuthGuard } from '@auth/auth.guard';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Permissions } from '@auth/permission.list';
import { UsuarioDepositoDTO } from '@dto/depositos/usuario-deposito.dto';

@Controller('usuariosdepositos')
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
export class UsuariosDepositosController {

    constructor(
        private usuariosDepositosSrv: UsuariosDepositosService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.USUARIOSDEPOSITOS.CONSULTAR)
    findAll(
        @Query() queries: QueriesType
    ): Promise<UsuarioDepositoView[]>{
        return this.usuariosDepositosSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.USUARIOSDEPOSITOS.CONSULTAR)
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.usuariosDepositosSrv.count(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.USUARIOSDEPOSITOS.CONSULTARULTIMOID)
    getLastId(): Promise<number>{
        return this.usuariosDepositosSrv.getLastId();
    }

    @Get(':id')
    @RequirePermission(Permissions.USUARIOSDEPOSITOS.CONSULTAR)
    findById(
        @Param('id') id: number
    ): Promise<UsuarioDepositoView>{
        return this.usuariosDepositosSrv.findById(id);
    }

    @Post()
    @RequirePermission(Permissions.USUARIOSDEPOSITOS.REGISTRAR)
    async create(
        @Body() usuarioDepositoDto: UsuarioDepositoDTO,
        @Headers('authorization') auth: string
    ){
        await this.usuariosDepositosSrv.create(
            DTOEntityUtis.usuarioDepositoDTOtoEntity(usuarioDepositoDto),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @RequirePermission(Permissions.USUARIOSDEPOSITOS.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() usuarioDepositoDto: UsuarioDepositoDTO,
        @Headers('authorization') auth: string
    ){
        await this.usuariosDepositosSrv.edit(
            oldId,
            DTOEntityUtis.usuarioDepositoDTOtoEntity(usuarioDepositoDto),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @RequirePermission(Permissions.USUARIOSDEPOSITOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.usuariosDepositosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }
}

type QueriesType = {[name: string]: any};
