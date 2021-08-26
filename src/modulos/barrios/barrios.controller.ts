import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { BarriosService } from './barrios.service';
import { Barrio } from '../../dto/barrio.dto';
import { ServerResponseList } from '../../dto/server-response-list.dto';

@Controller('barrios')
@UseGuards(AuthGuard)
export class BarriosController {

    constructor(
        private barriosSrv: BarriosService
    ){}

    @Get()
    @RequirePermission(Permissions.BARRIOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<Barrio>>{
        try{
            const data: Barrio[] = await this.barriosSrv.findAll({eliminado, sort, limit, offset});
            const rowCount: number = await this.barriosSrv.count({eliminado});
            return new ServerResponseList<Barrio>(data, rowCount);
        }catch(e){
            console.log('Error al consultar barrios');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    descriptioin: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('total')
    @RequirePermission(Permissions.BARRIOS.CONSULTAR)
    async count(
        @Query('eliminado') eliminado: boolean
    ){
        try{
            return await this.barriosSrv.count({eliminado});
        }catch(e){
            console.log('Error al consultar total de registros de Barrios');
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
    @RequirePermission(Permissions.BARRIOS.REGISTRAR)
    async create(
        @Body() b: Barrio
    ){
        try{
            await this.barriosSrv.create(b);
        }catch(e){
            console.log('Error al registrar Barrio');
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
    @RequirePermission(Permissions.BARRIOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ){
        try{
            const rows: Barrio[] = await this.barriosSrv.findById(id);
            if(rows.length === 0){
                throw new HttpException(
                    {
                        request: 'post',
                        description: `No se encontró con el Barrio con código ${id}.`
                    },
                    HttpStatus.NOT_FOUND
                );
            }else{
                return rows[0];
            }
        }catch(e){
            console.log('Error al consultar Barrio por ID');
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
    @RequirePermission(Permissions.BARRIOS.EDITAR)
    async edit(
        @Param('id') oldId: number, @Body() b: Barrio
    ){
        try{
            const rowCount: number = (await this.barriosSrv.edit(oldId, b)).rowCount;
            if(rowCount === 0){
                throw new HttpException(
                    {
                        request: 'put',
                        description: `No se encontró con el Barrio con código ${oldId}.`
                    },
                    HttpStatus.NOT_FOUND
                );
            }
        }catch(e){
            console.log('Error al editar Barrio');;
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
    @RequirePermission(Permissions.BARRIOS.ELIMINAR)
    async delete(
        @Param('id') id: number
    ){
        try{
            const rowCount: number = (await this.barriosSrv.delete(id)).rowCount;
            if(rowCount === 0){
                throw new HttpException(
                    {
                        request: 'put',
                        description: `No se encontró con el Barrio con código ${id}.`
                    },
                    HttpStatus.NOT_FOUND
                );
            }
        }catch(e){
            console.log('Error al eliminar Barrio');
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
