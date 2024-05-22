import { Controller, Post, Body, UseFilters, Param, Get, Query } from '@nestjs/common';
import { SesionService } from './sesion.service';
import { TokenSesionDTO } from '../../global/dto/token-sesion.dto';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { PermisosService } from '@modulos/permisos/permisos.service';
import { Funcionalidad } from '@database/entity/funcionalidad.entity';
import { RolView } from '@database/view/rol.view';
import { UsuariosService } from '@modulos/usuarios/usuarios.service';

@Controller('sesion')
@UseFilters(HttpExceptionFilter)
export class SesionController {

    constructor(
        private sesionSrv: SesionService,
        private permisosSrv: PermisosService,
        private usuariosSrv: UsuariosService
    ) { }

    @Get('permisos/:idusuario')
    findPermisos(
        @Param('idusuario') idusuario: number,
        @Query() queries: {[name: string]: any}
    ): Promise<Funcionalidad[]>{
        return this.permisosSrv.findPermisosByIdUsuario(idusuario, queries);
    }

    @Get('roles/:idusuario')
    findRoles(
        @Param('idusuario') idusuario: number
    ): Promise<RolView[]>{
        return this.usuariosSrv.findRolesByUsuario(idusuario);
    }

    @Post('login')
    login(
        @Body() user: { ci: string, password: string }
    ): Promise<TokenSesionDTO> {
        return this.sesionSrv.login(user.ci, user.password);
    }

    @Post('refresh')
    refresh(@Body() token: { refreshToken: string }): Promise<TokenSesionDTO> {
        try{
            return this.sesionSrv.refresh(token.refreshToken);
        }catch(e){
            console.log('Error al refrescar token', e);
            this.sesionSrv.logout(token.refreshToken);
            throw e;
        }
    }

    @Post('logout')
    async logout(@Body() token: {refreshToken: string}){
        await this.sesionSrv.logout(token.refreshToken)
    }
}
