import { Req, Request, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { UsuariosService } from './usuarios.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { UsuarioDTO } from '@dto/usuario.dto';
import { UsuarioView } from '@database/view/usuario.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@database/dto-entity-utils';

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
        /*try{
            await this.usuarioSrv.create(u, this.jwtUtil.decodeIdUsuario(request));
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
        }*/
    }

    @Get(':id')
    @RequirePermission(Permissions.USUARIOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<UsuarioView>{
        return this.usuarioSrv.findById(id);
        /*try{
            const u: UsuarioDTO | null = await this.usuarioSrv.findById(id);
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
        }*/
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
        /*try{
            if(!(await this.usuarioSrv.edit(oldId, u, this.jwtUtil.decodeIdUsuario(request)))) throw new HttpException(
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
        }*/
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

        /*try{
            if(!(await this.usuarioSrv.delete(id, this.jwtUtil.decodeIdUsuario(request)))) throw new HttpException(
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
        }*/
    }

}
