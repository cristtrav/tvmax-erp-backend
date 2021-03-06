import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards, Request } from '@nestjs/common';
import { Departamento } from '../../dto/departamento.dto';
import { AuthGuard } from '../../global/auth/auth.guard';
import { Permissions } from '../../global/auth/permission.list';
import { RequirePermission } from '../../global/auth/require-permission.decorator';
import { DepartamentosService } from './departamentos.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('departamentos')
@UseGuards(AuthGuard)
export class DepartamentosController {

    constructor(
        private departamentoSrv: DepartamentosService,
        private jwtSrv: JwtService
    ) { }

    @Get()
    @RequirePermission(Permissions.DEPARTAMENTOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Query('id') id: number[]
    ): Promise<ServerResponseList<Departamento>> {
        try {
            const data: Departamento[] = await this.departamentoSrv.findAll({ eliminado, sort, id, offset, limit });
            const rowCount: number = await this.departamentoSrv.count({eliminado, id});
            return new ServerResponseList<Departamento>(data, rowCount);
        } catch (e) {
            console.log('Error al consultar departamentos');
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
    @RequirePermission(Permissions.DEPARTAMENTOS.CONSULTAR)
    async count(
        @Query('eliminado') eliminado: boolean
    ) {
        try {
            return await this.departamentoSrv.count({ eliminado });
        } catch (e) {
            console.log('Error al obtener total de departamentos');
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
    @RequirePermission(Permissions.DEPARTAMENTOS.REGISTRAR)
    async create(
        @Body() d: Departamento,
        @Req() request: Request
    ) {
        try {
            const authToken: string = request.headers['authorization'].split(" ")[1];
            const idusuario = Number(this.jwtSrv.decode(authToken)['sub']);
            await this.departamentoSrv.create(d, idusuario);
        } catch (e) {
            console.log('Error al registrar departamento');
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
    @RequirePermission(Permissions.DEPARTAMENTOS.EDITAR)
    async update(
        @Param('id') oldId: string,
        @Body() d: Departamento,
        @Req() request: Request
    ) {
        try {
            const authToken: string = request.headers['authorization'].split(" ")[1];
            const idusuario = Number(this.jwtSrv.decode(authToken)['sub']);
            if (await this.departamentoSrv.update(oldId, d, idusuario) === 0) {
                throw new HttpException(
                    {
                        request: 'put',
                        description: `No se encontr?? el Departamento con c??digo ${oldId}`
                    },
                    HttpStatus.NOT_FOUND
                );
            }
        } catch (e) {
            console.log('Error al modificar Departamento');
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
    @RequirePermission(Permissions.DEPARTAMENTOS.CONSULTAR)
    async findById(
        @Param('id') id: string
    ){
        try{
            const rows: Departamento[] = await this.departamentoSrv.findById(id);
            if(rows.length === 0){
                throw new HttpException(
                    {
                        request: 'get',
                        description: `No se encontr?? el Departamento con c??digo ${id}`
                    },
                    HttpStatus.NOT_FOUND
                );
            }
            return rows[0];
        }catch(e){
            console.log('Error al consultar Departamento por ID');
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
    @RequirePermission(Permissions.DEPARTAMENTOS.ELIMINAR)
    async delete(
        @Param('id') id: string,
        @Req() request: Request
    ){
        try{
            const authToken: string = request.headers['authorization'].split(" ")[1];
            const idusuario = Number(this.jwtSrv.decode(authToken)['sub']);
            if(await this.departamentoSrv.delete(id, idusuario) === 0){
                throw new HttpException(
                    {
                        request: 'delete',
                        description: `No se encontr?? el Departamento con c??digo ${id}`
                    },
                    HttpStatus.NOT_FOUND
                );
            }
        }catch(e){
            console.log('Error al eliminar Departamento');
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
