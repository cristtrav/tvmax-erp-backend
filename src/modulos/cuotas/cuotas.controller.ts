import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { CobroCuota } from '@dto/cobro-cuota.dto';
import { CuotaDTO } from '@dto/cuota.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Request, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards, Headers, UseFilters } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { CuotasService } from './cuotas.service';
import { CuotaView } from '@database/view/cuota.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';

@Controller('cuotas')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class CuotasController {

    constructor(
        private cuotaSrv: CuotasService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.CUOTAS.CONSULTAR)
    async findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<CuotaView[]>{
        return this.cuotaSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.CUOTAS.CONSULTAR)
    async count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.cuotaSrv.count(queries);
    }

    @Get(':id')
    @RequirePermission(Permissions.CUOTAS.CONSULTAR)
    async findById(
        @Param('id') idc: number
    ): Promise<CuotaView>{
        return this.cuotaSrv.findById(idc);
    }

    @Get(':id/cobro')
    @RequirePermission(Permissions.CUOTAS.CONSULTAR)
    async findCobroCuota(
        @Param('id') idcuota: number
    ): Promise<CobroCuota>{
        let cobroCuota: CobroCuota | null = null;
        try{
            cobroCuota = await this.cuotaSrv.findCobro(idcuota);
            
        }catch(e){
            console.log('Error al consultar cobro de cuota');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        if(cobroCuota !== null) return cobroCuota;
        throw new HttpException(
            {
                request: 'get',
                description: `No se encontró cobro para la cuota '${idcuota}'.`
            },
            HttpStatus.NOT_FOUND
        );
    }

    @Post()
    @RequirePermission(Permissions.CUOTAS.REGISTRAR)
    async create(
        @Body() c: CuotaDTO,
        @Headers('authorization') auth: string
    ){
        await this.cuotaSrv.create(
            DTOEntityUtis.cuotaDtoToEntity(c),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @RequirePermission(Permissions.CUOTAS.EDITAR)
    async edit(
        @Param('id') oldid: number,
        @Body() c: CuotaDTO,
        @Headers('authorization') auth: string
    ){
        await this.cuotaSrv.edit(
            oldid,
            DTOEntityUtis.cuotaDtoToEntity(c),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @RequirePermission(Permissions.CUOTAS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.cuotaSrv.delete(
            id,
            this.jwtUtil.extractJwtSub(auth)
        );
    }

}
