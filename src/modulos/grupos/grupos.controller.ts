import { Controller, Get, HttpException, HttpStatus, Post, Body, Put, Param, Delete, UseGuards, SetMetadata, Req, Query } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { Grupo } from './../../dto/grupo.dto';
import { AuthGuard } from './../../global/auth/auth.guard';
import { Permissions } from '../../global/auth/permission.list';
import { RequirePermission } from '../../global/auth/require-permission.decorator';
import { ServerResponseList } from '../../dto/server-response-list.dto';

@Controller('grupos')
@UseGuards(AuthGuard)
export class GruposController {

    constructor(
        private gruposSrv: GruposService
    ){ }

    @Get()
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('limit') limit: number,
        @Query('offset') offset: number
    ): Promise<ServerResponseList<Grupo>> {
        try{
            const data: Grupo[] = await this.gruposSrv.findAll({eliminado, sort, limit, offset});
            const rowCount: number = await this.gruposSrv.count({eliminado});
            return new ServerResponseList<Grupo>(data, rowCount);
        }catch(e){
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message 
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get('total')
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async getTotal(
        @Query('eliminado') eliminado: boolean
    ): Promise<number>{
        try{
            return await this.gruposSrv.count({ eliminado })
        }catch(e){
            console.log('Error al contar')
            console.log(e)
            throw new HttpException({}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    
    @Get(':id')
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async findById(@Param('id') id: number): Promise<Grupo>{
        try{    
            return await this.gruposSrv.findById(id);
        }catch(e){
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Post()
    @RequirePermission(Permissions.GRUPOS.REGISTRAR)
    async create(@Body() grupo: Grupo){
        try{
            await this.gruposSrv.create(grupo)
        }catch(e){
            console.error('Error al registrar Grupo', e)
            throw new HttpException(
                {
                    request: 'post',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Put(':id')
    @RequirePermission(Permissions.GRUPOS.EDITAR)
    async update(@Body() grupo: Grupo, @Param('id') idviejo: string){
        try{
            const cantEditada = await this.gruposSrv.update(idviejo, grupo);
            if(cantEditada  === 0){
                throw new HttpException(
                    {
                        request: 'put',
                        description: `No se encontró el Grupo con código ${idviejo}`
                    },
                    HttpStatus.NOT_FOUND
                )
            }
        }catch(e){
            console.error('Error al modificar Grupo', e);
            throw new HttpException(
                {
                    request: 'put',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Delete(':id')
    @RequirePermission(Permissions.GRUPOS.ELIMINAR)
    async delete(@Param('id') id: string){
        var cantEliminada = 0
        try{
            cantEliminada = await this.gruposSrv.delete(id)
        }catch(e){
            console.error('Error al eliminar Grupo', e)
            throw new HttpException(
                {
                    request: 'delete',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
                )
        }
        if(cantEliminada === 0) {
            throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontró el Grupo con código ${id}`
                },
                HttpStatus.NOT_FOUND
            )
        }
    }
}
