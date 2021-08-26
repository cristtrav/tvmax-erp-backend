import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Distrito } from '../../dto/distrito.dto';
import { Permissions } from '../../global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { DistritosService } from './distritos.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';

@Controller('distritos')
@UseGuards(AuthGuard)
export class DistritosController {

    constructor(
        private distritosSrv: DistritosService
    ){}

    @Get()
    @RequirePermission(Permissions.DISTRITOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('limit') limit: number,
        @Query('offset') offset: number
    ): Promise<ServerResponseList<Distrito>>{
        try{
            const data: Distrito[] = await this.distritosSrv.findAll({eliminado, sort, limit, offset});
            const rowCount: number = await this.distritosSrv.count({eliminado});
            return new ServerResponseList<Distrito>(data, rowCount);
        }catch(e){
            console.log('Error al consultar distritos');
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

    @Get('total')
    @RequirePermission(Permissions.DISTRITOS.CONSULTAR)
    async count(
        @Query('eliminado') eliminado: boolean
    ){
        try{
            return await this.distritosSrv.count({eliminado});
        }catch(e){
            console.log('Error al obtener el total de Distritos');
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
    @RequirePermission(Permissions.DISTRITOS.REGISTRAR)
    async create(
        @Body() d: Distrito
    ){
        try{
            await this.distritosSrv.create(d);
        }catch(e){
            console.log('Error al registrar distrito');
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
    @RequirePermission(Permissions.DISTRITOS.CONSULTAR)
    async findById(
        @Param('id') id: string
    ){
        try{
            const dists: Distrito[] = await this.distritosSrv.findById(id);
            if(dists.length === 0){
                throw new HttpException(
                    {
                        request: 'get',
                        description: `No se encontró el Distrito con código ${id}.`
                    },
                    HttpStatus.NOT_FOUND
                );
            }else{
                return dists[0];
            }
        }catch(e){
            console.log('Error al consultar Distrito por ID');
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
    @RequirePermission(Permissions.DISTRITOS.EDITAR)
    async edit(
        @Param('id') oldId: string,
        @Body() d: Distrito
    ){
        try{
            const rowCount = (await this.distritosSrv.edit(oldId, d)).rowCount;
            if(rowCount === 0){
                throw new HttpException(
                    {
                        request: 'put',
                        description: `No se encontró el Distrito con código ${oldId}.`
                    },
                    HttpStatus.NOT_FOUND
                );
            }
        }catch(e){
            console.log('Error al editar Distrito');
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
    @RequirePermission(Permissions.DISTRITOS.ELIMINAR)
    async delete(
        @Param('id') id: string
    ){
        try{
            const rowCount: number = (await this.distritosSrv.delete(id)).rowCount;
            if(rowCount === 0){
                throw new HttpException(
                    {
                        request: 'delete',
                        description: `No se encontró el Distrito con código ${id}.`
                    },
                    HttpStatus.NOT_FOUND
                );
            }
        }catch(e){
            console.log('Error al eliminar distrito');
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
