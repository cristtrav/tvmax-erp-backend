import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { Cobrador } from '../../dto/cobrador.dto';
import { CobradoresService } from './cobradores.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';

@Controller('cobradores')
export class CobradoresController {

    constructor(
        private cobradorSrv: CobradoresService
    ){}

    @Get()
    @RequirePermission(Permissions.COBRADORES.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<Cobrador>>{
        try{
            const rows: Cobrador[] = await this.cobradorSrv.findAll({eliminado, sort, offset, limit});
            const rowCount: number = await this.cobradorSrv.count({eliminado});
            return new ServerResponseList<Cobrador>(rows, rowCount);
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
        @Body() c: Cobrador
    ){
        try{
            await this.cobradorSrv.create(c);
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
    ): Promise<Cobrador>{
        try{
            const c: Cobrador = await this.cobradorSrv.findById(id);
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
        @Param('id') oldId: number, @Body() c: Cobrador
    ){
        try{
            if(!(await this.cobradorSrv.edit(oldId, c))) throw new HttpException(
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
        @Param('id') id: number
    ){
        try{
            if(!(await this.cobradorSrv.delete(id))) throw new HttpException(
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