import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Timbrado } from '@dto/timbrado.dto';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { TimbradosService } from './timbrados.service';

@Controller('timbrados')
export class TimbradosController {

    constructor(
        private timbradosSrv: TimbradosService
    ){ }

    @Post()
    @RequirePermission(Permissions.TIMBRADOS.REGISTRAR)
    async create(
        @Body() t: Timbrado
    ){
        try{
            await this.timbradosSrv.create(t);
        }catch(e){
            console.log('Error al registrar timbrado');
            console.log(e);
            throw new HttpException(
                {
                    request:  'post',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    @RequirePermission(Permissions.TIMBRADOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('offset') offset: string,
        @Query('limit') limit: number,
        @Query('sort') sort: string
    ): Promise<ServerResponseList<Timbrado>>{
        try{
            const rows: Timbrado[] = await this.timbradosSrv.findAll({eliminado, sort, offset, limit});
            const count: number = await this.timbradosSrv.count({eliminado});
            const srp: ServerResponseList<Timbrado> = new ServerResponseList(rows, count);
            return srp;
        }catch(e){
            console.log('Error al consultar timbrados');
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

    @Get(':id')
    @RequirePermission(Permissions.TIMBRADOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ){
        try{
            const t: Timbrado = await this.timbradosSrv.findById(id);
            if(!t) throw new HttpException(
                {
                    request: 'get',
                    description: `No se encontró el timbrado con código ${id}`
                },
                HttpStatus.NOT_FOUND
            );
            return t;
        }catch(e){
            console.log('Error al consultar timbrado por id');
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
    @RequirePermission(Permissions.TIMBRADOS.EDITAR)
    async edit(
        @Param('id') oldid: number,
        @Body() t: Timbrado
    ){
        try{
            if(!(await this.timbradosSrv.edit(oldid, t))) throw new HttpException(
                {
                    request: 'put',
                    description: `No se encontró el timbrado con código ${oldid}`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al editar timbrado');
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
    @RequirePermission(Permissions.TIMBRADOS.ELIMINAR)
    async delete(
        @Param('id') id: number
    ){
        try{
            if(!(await this.timbradosSrv.delete(id))) throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontró el timbrado con código ${id}`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al eliminar timbrado');
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
