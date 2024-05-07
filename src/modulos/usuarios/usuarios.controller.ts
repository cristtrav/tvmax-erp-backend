import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { Permissions } from '@auth/permission.list';
import { UsuariosService } from './usuarios.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { UsuarioDTO } from 'src/global/dto/usuario.dto';
import { UsuarioView } from '@database/view/usuario.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { RolView } from '@database/view/rol.view';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('usuarios')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class UsuariosController {

    constructor(
        private usuarioSrv: UsuariosService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(
        Permissions.USUARIOS.CONSULTAR,
        Permissions.CLIENTES.ACCESOFORMULARIO,
        Permissions.CLIENTES.ACCESOMODULO,
        Permissions.SUSCRIPCIONES.ACCESOMODULO,
        Permissions.PAGOSCLIENTES.ACCESOMODULO,
        Permissions.VENTAS.ACCESOMODULO,
        Permissions.MOVIMIENTOSMATERIALES.ACCESOMODULO,
        Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO,
        Permissions.AUDITORIA.ACCESOMODULO
    )
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<UsuarioView[]> {
        return this.usuarioSrv.findAll(queries);
    }

    @Get('ultimoid')
    @AllowedIn(
        Permissions.USUARIOS.ACCESOFORMULARIO,
        Permissions.USUARIOSDEPOSITOS.ACCESOFORMULARIO
    )
    getLastId(): Promise<number>{
        return this.usuarioSrv.getLastId();
    }

    @Get('total')
    @AllowedIn(Permissions.USUARIOS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ):Promise<number>{
        return this.usuarioSrv.count(queries);
    }

    @Post()
    @AllowedIn(Permissions.USUARIOS.REGISTRAR)
    async create(
        @Body() u: UsuarioDTO,
        @Headers('authorization') auth: string
    ){
        await this.usuarioSrv.create(
            DTOEntityUtis.usuarioDtoToEntity(u),
            u.idroles,
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Post(':id/password')
    @AllowedIn(Permissions.USUARIOS.CAMBIARPASS)
    async changePassword(
        @Param('id') id: number,
        @Body() passwords: { oldPass: string, newPass: string }
    ){
        await this.usuarioSrv.changePassword(id, passwords.oldPass, passwords.newPass);
    }

    @Get(':id/roles')
    @AllowedIn(
        Permissions.ROLESUSUARIOS.CONSULTAR,
        Permissions.USUARIOSDEPOSITOS.ACCESOMODULO
    )
    findRolesByUsuario(
        @Param('id') id: number
    ): Promise<RolView[]>{
        return this.usuarioSrv.findRolesByUsuario(id);
    }

    @Put(':id/roles')
    @AllowedIn(Permissions.ROLESUSUARIOS.EDITAR)
    async editRolesByUsuario(
        @Param('id') id: number,
        @Body() body: {idroles: number[]},
        @Headers('authorization') auth: string
    ){
        await this.usuarioSrv.editRolesByUsuario(
            id,
            body.idroles,
            this.jwtUtil.extractJwtSub(auth)
        )
    }

    @Get(':id')
    @AllowedIn(
        Permissions.USUARIOS.ACCESOFORMULARIO,
        Permissions.ROLESUSUARIOS.ACCESOMODULO,
        Permissions.PERMISOS.ACCESOFORMULARIO,
        Permissions.VENTAS.ACCESOMODULO
    )
    async findById(
        @Param('id') id: number
    ): Promise<UsuarioView>{
        return this.usuarioSrv.findById(id);
    }

    @Put(':id')
    @AllowedIn(Permissions.USUARIOS.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() u: UsuarioDTO,
        @Headers('authorization') auth: string
    ){
        await this.usuarioSrv.edit(
            oldId,
            DTOEntityUtis.usuarioDtoToEntity(u),
            u.idroles,
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @AllowedIn(Permissions.USUARIOS.ELIMINAR)
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
