import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Cliente } from '@dto/cliente.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Suscripcion } from '@dto/suscripcion.dto';
import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
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
    @RequirePermission(Permissions.SUSCRIPCIONES.REGISTRAR)
    async create(
        @Body() s: Suscripcion
    ){
        try{

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

}
