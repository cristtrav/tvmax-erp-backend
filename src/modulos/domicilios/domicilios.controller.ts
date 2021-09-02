import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Domicilio } from '@dto/domicilio.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { DomiciliosService } from './domicilios.service';

@Controller('domicilios')
//@UseGuards(AuthGuard)
export class DomiciliosController {

    constructor(
        private domiciliosSrv: DomiciliosService
    ){}

    @Get()
    //@RequirePermission(Permissions.DOMICILIOS.CONSULTAR)
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

}
