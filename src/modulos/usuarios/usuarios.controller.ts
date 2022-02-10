import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { UsuariosService } from './usuarios.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';
import { Usuario } from 'src/dto/usuario.dto';

@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {

    constructor(
        private usuarioSrv: UsuariosService
    ){}

    @Get()
    @RequirePermission(Permissions.USUARIOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<Usuario>> {
        try{
            const data: Usuario[] = await this.usuarioSrv.findAll({eliminado, sort, offset, limit});
            const rowCount: number = await this.usuarioSrv.count({eliminado});
            return new ServerResponseList<Usuario>(data, rowCount);
        }catch(e){
            console.log('Error al consultar usuarios');
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

    @Post()
    @RequirePermission(Permissions.USUARIOS.REGISTRAR)
    async create(
        @Body() u: Usuario
    ){
        try{
            await this.usuarioSrv.create(u);
        }catch(e){
            console.log('Error al registrar Usuario');
            console.log(e);
            throw new HttpException(
                {
                    request: 'post',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':id')
    @RequirePermission(Permissions.USUARIOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<Usuario>{
        try{
            const u: Usuario | null = await this.usuarioSrv.findById(id);
            if(!u) throw new HttpException(
                {
                    request: 'get',
                    description: `No se encontró el Usuario con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
            return u;
        }catch(e){
            console.log('Error al consultar Usuario por ID');
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

    @Put(':id')
    @RequirePermission(Permissions.USUARIOS.EDITAR)
    async edit(
        @Param('id') oldId: number, @Body() u: Usuario
    ){
        try{
            if(!(await this.usuarioSrv.edit(oldId, u))) throw new HttpException(
                {
                    request: 'put',
                    description: `No se encontró el Usuario con código ${oldId}.`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al editar Usuario');
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

    @Delete(':id')
    @RequirePermission(Permissions.USUARIOS.ELIMINAR)
    async delete(
        @Param('id') id: number
    ){
        try{
            if(!(await this.usuarioSrv.delete(id))) throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontró el Usuario con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al eliminar Usuario');
            console.log(e);
            throw new HttpException(
                {
                    request: 'delete',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}