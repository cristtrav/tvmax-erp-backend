import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Cliente } from '@dto/cliente.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';

@Controller('clientes')
@UseGuards(AuthGuard)
export class ClientesController {

    constructor(
        private clientesSrv: ClientesService
    ){}

    @Get()
    @RequirePermission(Permissions.CLIENTES.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number
    ): Promise<ServerResponseList<Cliente>>{
        try{
            const rows: Cliente[] = await this.clientesSrv.findAll({eliminado, sort, offset, limit});
            const rowCount: number = await this.clientesSrv.count({eliminado});
            return new ServerResponseList<Cliente>(rows, rowCount);
        }catch(e){
            console.log('Error al consultar Clientes');
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
    @RequirePermission(Permissions.CLIENTES.REGISTRAR)
    async create(
        @Body() s: Cliente
    ){
        try{
            await this.clientesSrv.create(s);
        }catch(e){
            console.log('Error al registrar suscripcion');
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

    @Get('ultimoid')
    @RequirePermission(Permissions.CLIENTES.CONSULTAR)
    async getLastId(): Promise<number>{
        try{
            return await this.clientesSrv.getLastId();
        }catch(e){
            console.log('Error al consultar ultimo ID');
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
    @RequirePermission(Permissions.CLIENTES.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<Cliente>{
        try{
            const cli: Cliente = await this.clientesSrv.findById(id);
            if(!cli) throw new HttpException(
                {
                    request: 'get',
                    description: `No se encontró el cliente con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
            return cli;
        }catch(e){
            console.log('Error al consultar cliente por id');
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
    @RequirePermission(Permissions.CLIENTES.EDITAR)
    async edit(
        @Param('id') oldId: number, @Body() c: Cliente
    ){
        try{
            if(!(await this.clientesSrv.edit(oldId, c))) throw new HttpException(
                {
                    request: 'put',
                    description: `No se encontró el cliente con código ${oldId}.`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al editar cliente');
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
    @RequirePermission(Permissions.CLIENTES.ELIMINAR)
    async delete(
        @Param('id') id: number
    ){
        try{
            if(!(await this.clientesSrv.delete(id))) throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontró el cliente con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al eliminar cliente');
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
