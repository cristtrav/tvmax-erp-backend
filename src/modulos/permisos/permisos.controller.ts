import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Funcionalidad } from '@dto/funcionalidad.dto';
import { Modulo } from '@dto/modulo.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Body, Controller, Get, HttpException, HttpStatus, Param, Put, Query, UseGuards } from '@nestjs/common';
import { PermisosService } from './permisos.service';

@Controller('permisos')
@UseGuards(AuthGuard)
export class PermisosController {

    constructor(
        private permisosSrv: PermisosService
    ){}

    @Get()
    @RequirePermission(Permissions.PERMISOS.CONSULTARMODULOSFUNCIONALIDADES)
    async findAllModulos(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string
    ): Promise<ServerResponseList<Modulo>>{
        try{
            const modulos: Modulo[] = await this.permisosSrv.findAllModulos({eliminado, sort});
            return new ServerResponseList(modulos, modulos.length);
        }catch(e){
            console.log('Error al consultar modulos y funcionalidades');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':idusuario')
    @RequirePermission(Permissions.PERMISOS.CONSULTARPERMISOSUSUARIO)
    async findAllByIdusuario(
        @Param('idusuario') idusuario: number,
        @Query('sort') sort: string
    ): Promise<ServerResponseList<Funcionalidad>>{
        try{
            const lstFunc: Funcionalidad[] = await this.permisosSrv.findByIdUsuario(idusuario, { sort });
            return new ServerResponseList(lstFunc, lstFunc.length);
        }catch(e){
            console.log('Error al consultar permisos de usuario');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put(':idusuario')
    @RequirePermission(Permissions.PERMISOS.EDITARPERMISOSUSUARIO)
    async editPermisosUsuario(
        @Param('idusuario') idusuario: number,
        @Body() idfuncionalidades: number[]
    ){
        try{
            await this.permisosSrv.editPermisosUsuario(idusuario, idfuncionalidades);
        }catch(e){
            console.log('Error al editar permisos de usuario');
            console.log(e);
            throw new HttpException(
                {
                    request: 'put',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
