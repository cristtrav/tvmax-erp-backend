import { Request, Req, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { CobradoresService } from './cobradores.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Funcionario } from '@dto/funcionario.dto';

@Controller('cobradores')
export class CobradoresController {

    constructor(
        private cobradorSrv: CobradoresService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.COBRADORES.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<Funcionario>>{
        try{
            const rows: Funcionario[] = await this.cobradorSrv.findAll({eliminado, sort, offset, limit});
            const rowCount: number = await this.cobradorSrv.count({eliminado});
            return new ServerResponseList<Funcionario>(rows, rowCount);
        }catch(e){
            console.log('Error al consultar cobradores');
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
    @RequirePermission(Permissions.COBRADORES.REGISTRAR)
    async create(
        @Body() c: Funcionario,
        @Req() request: Request
    ){
        try{
            await this.cobradorSrv.create(c, this.jwtUtil.decodeIdUsuario(request));
        }catch(e){
            console.log('Error al registrar cobrador');
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
    @RequirePermission(Permissions.COBRADORES.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<Funcionario>{
        try{
            const c: Funcionario = await this.cobradorSrv.findById(id);
            if(!c) throw new HttpException(
                {
                    request: 'get',
                    description: `No se encontró el Cobrador con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
            return c;
        }catch(e){
            console.log('Error al consultar cobrador por id');
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
    @RequirePermission(Permissions.COBRADORES.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() c: Funcionario,
        @Req() request: Request
    ){
        try{
            if(!(await this.cobradorSrv.edit(oldId, c, this.jwtUtil.decodeIdUsuario(request)))) throw new HttpException(
                {
                    request: 'put',
                    description: `No se encontró el Cobrador con código ${oldId}.`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al editar cobrador');
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
    @RequirePermission(Permissions.COBRADORES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Req() request: Request
    ){
        try{
            if(!(await this.cobradorSrv.delete(id, this.jwtUtil.decodeIdUsuario(request)))) throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontró el Cobrador con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al eliminar cobrador');
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
