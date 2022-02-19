import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../global/auth/auth.guard';
import { Servicio } from '../../dto/servicio.dto';
import { ServiciosService } from './servicios.service';
import { RequirePermission } from '../../global/auth/require-permission.decorator';
import { Permissions } from '../../global/auth/permission.list';
import { ServerResponseList } from '../../dto/server-response-list.dto';

@Controller('servicios')
@UseGuards(AuthGuard)
export class ServiciosController {

    constructor(
        private serviciosSrv: ServiciosService
    ){}

    @Get()
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('suscribible') suscribible: boolean,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Query('sort') sort: string,
        @Query('idgrupo') idgrupo: string[],
        @Query('search') search: string,
        @Query('id') id: number[]
    ): Promise<ServerResponseList<Servicio>>{
        try{
            const data: Servicio[] = await this.serviciosSrv.findAll({eliminado, idgrupo, search, suscribible, id, offset, limit, sort});
            const rowCount: number = await this.serviciosSrv.count({eliminado, idgrupo, suscribible, search, id});
            return new ServerResponseList<Servicio>(data, rowCount);
        }catch(e){
            console.log('Error al consultar Servicios')
            console.log(e)
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
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    async count(
        @Query('eliminado') eliminado: boolean
    ): Promise<number>{
        try{
            return this.serviciosSrv.count({eliminado})
        }catch(e){
            console.log('Error al consultar total de registros de Servicios')
            console.log(e)
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
    @RequirePermission(Permissions.SERVICIOS.REGISTRAR)
    async create(@Body() servicio: Servicio){
        try{
            this.serviciosSrv.create(servicio)
        }catch(e){
            console.log(`Error al regisrar Servicio`)
            console.log(e)
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
    @RequirePermission(Permissions.SERVICIOS.EDITAR)
    async update(@Param('id') oldid: number, @Body() s: Servicio){
        try{
            const rowCount: number = (await this.serviciosSrv.update(oldid, s)).rowCount
            if(rowCount === 0){
                throw new HttpException(
                    {
                        request: 'put',
                        description: `No se encontró el Servicio con código ${oldid}`
                    },
                    HttpStatus.NOT_FOUND
                )
            }
        }catch(e){
            console.log('Error al editar servicio')
            console.log(e)
            throw new HttpException(
                {
                    request: 'put',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get(':id')
    @RequirePermission(Permissions.SERVICIOS.CONSULTAR)
    async findById(@Param('id') id: number){
        try{
            const srvs: Servicio[] = await this.serviciosSrv.findById(id)
            if(srvs.length === 0){
                throw new HttpException(
                    {
                        request: 'get',
                        description: `No se encontró el servicio con código ${id}`
                    },
                    HttpStatus.NOT_FOUND
                )
            }
            return srvs[0]
        }catch(e){
            console.log('Error al consultar Servicio por id')
            console.log(e)
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Delete(':id')
    @RequirePermission(Permissions.SERVICIOS.ELIMINAR)
    async delete(@Param('id') id: number){
        try{
            const rowCount: number = (await this.serviciosSrv.delete(id)).rowCount
            if(rowCount === 0){
                throw new HttpException(
                    {
                        request: 'get',
                        description: `No se encontró el servicio con código ${id}`
                    },
                    HttpStatus.NOT_FOUND
                )
            }
        }catch(e){
            console.log('Error al eliminar Servicio')
            console.log(e)
            throw new HttpException(
                {
                    request: 'delete',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

}
