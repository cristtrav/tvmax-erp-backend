import { Request, Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { TipoDomicilio } from '../..//dto/tipodomicilio.dto';
import { AuthGuard } from '../../global/auth/auth.guard';
import { Permissions } from '../../global/auth/permission.list';
import { RequirePermission } from '../../global/auth/require-permission.decorator';
import { TiposdomiciliosService } from './tiposdomicilios.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';
import { JwtUtilsService } from '@util/jwt-utils/jwt-utils.service';

@Controller('tiposdomicilios')
@UseGuards(AuthGuard)
export class TiposdomiciliosController {

    constructor(
        private tipoServSrv: TiposdomiciliosService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.TIPOSDOMICILIOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<TipoDomicilio>>{
        try{
            const data: TipoDomicilio[] = await this.tipoServSrv.findAll({eliminado, sort, offset, limit});
            const rowCount: number = await this.tipoServSrv.count({eliminado});
            return new ServerResponseList<TipoDomicilio>(data, rowCount);
        }catch(e){
            console.log('Error al consultar Tipos de Domicilios');
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
    @RequirePermission(Permissions.TIPOSDOMICILIOS.CONSULTAR)
    async count(
        @Query('eliminado') eliminado: boolean
    ){
        try{
            return await this.tipoServSrv.count({eliminado});
        }catch(e){
            console.log('Error al consultar total de registros de Tipos de Domicilios');
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
    @RequirePermission(Permissions.TIPOSDOMICILIOS.REGISTRAR)
    async create(
        @Body() td: TipoDomicilio,
        @Req() request: Request
    ){
        try{
            await this.tipoServSrv.create(td, this.jwtUtil.decodeIdUsuario(request));
        }catch(e){
            console.log('Error al registrar Tipo de Domicilio');
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
    @RequirePermission(Permissions.TIPOSDOMICILIOS.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() td: TipoDomicilio,
        @Req() request: Request
    ){
        try{
            if(!(await this.tipoServSrv.edit(oldId, td, this.jwtUtil.decodeIdUsuario(request)))){
                throw new HttpException(
                    {
                        request: 'put',
                        description: `No se encontró el Tipo de Domicilio con código ${oldId}.`
                    },
                    HttpStatus.NOT_FOUND
                );
            }
        }catch(e){
            console.log('Error al editar Tipo de Domicilio');
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
    @RequirePermission(Permissions.TIPOSDOMICILIOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ){
        try{
            const td: TipoDomicilio = await this.tipoServSrv.findById(id);
            if(!td) throw new HttpException(
                {
                    request: 'put',
                    description: `No se encontró el Tipo de Domicilio con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
            return td;
        }catch(e){
            console.log('Error al consultar Tipo de Domicilio por ID');
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
    @RequirePermission(Permissions.TIPOSDOMICILIOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Req() request: Request
    ){
        try{
            if(!(await this.tipoServSrv.delete(id, this.jwtUtil.decodeIdUsuario(request)))) throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontró el Tipo de Domicilio con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al eliminar tipo de domicilio');
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

    @Get('ultimoid')
    @RequirePermission(Permissions.TIPOSDOMICILIOS.CONSULTAR)
    async getLastId(): Promise<number>{
        try{
            return await this.tipoServSrv.getLastId();
        }catch(e){
            console.log('Error al consultar ultimo ID de tipos de domicilios');
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

}
