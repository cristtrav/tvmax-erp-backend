import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Domicilio } from '@dto/domicilio.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DomiciliosService } from './domicilios.service';

@Controller('domicilios')
@UseGuards(AuthGuard)
export class DomiciliosController {

    constructor(
        private domiciliosSrv: DomiciliosService
    ){}

    @Get()
    @RequirePermission(Permissions.DOMICILIOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Query('idcliente') idcliente: number
    ): Promise<ServerResponseList<Domicilio>>{
        try{
            const rows: Domicilio[] = await this.domiciliosSrv.findAll({eliminado, sort, offset, limit, idcliente});
            const rowCount: number = await this.domiciliosSrv.count({eliminado, idcliente});
            return new ServerResponseList(rows, rowCount);
        }catch(e){
            console.log('Error al consultar domicilios');
            console.log(e);
            throw new HttpException(
                {
                    request:  'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.DOMICILIOS.CONSULTAR)
    async getLastId(){
        try{
            return await this.domiciliosSrv.getLastId();
        }catch(e){
            console.log('Error al consultar ultimo ID de domicilios');
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
    @RequirePermission(Permissions.DOMICILIOS.REGISTRAR)
    async create(
        @Body() d: Domicilio
    ){
        try{
            await this.domiciliosSrv.create(d);
        }catch(e){
            console.log('Error al registrar domicilio');
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

    @Put(':id')
    @RequirePermission(Permissions.DOMICILIOS.EDITAR)
    async edit(
        @Param('id') oldId: number, @Body() d: Domicilio
    ){
        try{
            if(!(await this.domiciliosSrv.edit(oldId, d))) throw new HttpException(
                {
                    request: 'put',
                    description: `No se encontró el domicilio con código ${oldId}.`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al editar domicilio');
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

    @Get(':id')
    @RequirePermission(Permissions.DOMICILIOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<Domicilio> {
        try{
            const d: Domicilio | null = (await this.domiciliosSrv.findById(id));
            if(!d) throw new HttpException(
                {
                    request: 'get',
                    description: `No se encontró el domicilio con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
            return d;
        }catch(e){
            console.log('Error al consultar domicilio por ID');
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

    @Delete(':id')
    @RequirePermission(Permissions.DOMICILIOS.ELIMINAR)
    async delete(
        @Param('id') id: number
    ){
        try{
            if(!(await this.domiciliosSrv.delete(id))) throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontró el domicilio con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al eliminar domicilio');
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
