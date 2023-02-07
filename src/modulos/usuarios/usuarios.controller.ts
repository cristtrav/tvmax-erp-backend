import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { UsuariosService } from './usuarios.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { UsuarioDTO } from '@dto/usuario.dto';
import { UsuarioView } from '@database/view/usuario.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';

@Controller('usuarios')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class UsuariosController {

    constructor(
        private usuarioSrv: UsuariosService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.USUARIOS.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<UsuarioView[]> {
        return this.usuarioSrv.findAll(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.USUARIOS.CONSULTAR)
    getLastId(): Promise<number>{
        return this.usuarioSrv.getLastId();
    }

    @Get('total')
    @RequirePermission(Permissions.USUARIOS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ):Promise<number>{
        return this.usuarioSrv.count(queries);
    }

    @Post()
    @RequirePermission(Permissions.USUARIOS.REGISTRAR)
    async create(
        @Body() u: UsuarioDTO,
        @Headers('authorization') auth: string
    ){
        await this.usuarioSrv.create(
            DTOEntityUtis.usuarioDtoToEntity(u),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Get(':id')
    @RequirePermission(Permissions.USUARIOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<UsuarioView>{
        return this.usuarioSrv.findById(id);
    }

    @Put(':id')
    @RequirePermission(Permissions.USUARIOS.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() u: UsuarioDTO,
        @Headers('authorization') auth: string
    ){
        await this.usuarioSrv.edit(
            oldId,
            DTOEntityUtis.usuarioDtoToEntity(u),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @RequirePermission(Permissions.USUARIOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.usuarioSrv.delete(
            id,
            this.jwtUtil.extractJwtSub(auth)
        );
    }

}
