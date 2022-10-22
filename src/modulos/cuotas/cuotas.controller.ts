import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { CobroCuota } from '@dto/cobro-cuota.dto';
import { Cuota } from '@dto/cuota.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Request, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { CuotasService } from './cuotas.service';

@Controller('cuotas')
@UseGuards(AuthGuard)
export class CuotasController {

    constructor(
        private cuotaSrv: CuotasService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.CUOTAS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Query('idsuscripcion') idsuscripcion: number,
        @Query('idservicio') idservicio: number,
        @Query('pagado') pagado: boolean
    ): Promise<ServerResponseList<Cuota>>{
        try{
            const data: Cuota[] = await this.cuotaSrv.findAll({eliminado, sort, offset, limit, idsuscripcion, idservicio, pagado});
            const count: number = await this.cuotaSrv.count({eliminado, idsuscripcion, idservicio, pagado});
            const sr: ServerResponseList<Cuota> = new ServerResponseList<Cuota>(data, count);
            return sr;
        }catch(e){
            console.log('Error al consultar cuotas');
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
    @RequirePermission(Permissions.CUOTAS.CONSULTAR)
    async findById(
        @Param('id') idc: number
    ){
        try{
            const c: Cuota = await this.cuotaSrv.findById(idc);
            if(!c) throw new HttpException(
                {
                    request: 'get',
                    description: `No se encontró la cuota con código ${idc}`
                },
                    HttpStatus.NOT_FOUND
                );
            return c;
        }catch(e){
            console.log('Error al consultar cuota pod id');
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
        @Body() c: Cuota,
        @Req() request: Request
    ){
        try{
            await this.cuotaSrv.create(c, this.jwtUtil.decodeIdUsuario(request));
        }catch(e){
            console.log('Error al registrar cuota');
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
    @RequirePermission(Permissions.CUOTAS.EDITAR)
    async edit(
        @Param('id') oldid: number,
        @Body() c: Cuota,
        @Req() request: Request
    ){
        try{
            if(!(await this.cuotaSrv.edit(oldid, c, this.jwtUtil.decodeIdUsuario(request)))) throw new HttpException(
                {
                    request: 'put',
                    description: `No se encontró la cuota con código ${oldid}`
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log('Error al editar cuota');
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
    @RequirePermission(Permissions.CUOTAS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Req() request: Request
    ){
        try{
            if(!(await this.cuotaSrv.delete(id, this.jwtUtil.decodeIdUsuario(request)))) throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontró la cuota con código ${id}`                    
                },
                HttpStatus.NOT_FOUND
            );
        }catch(e){
            console.log(e);
            console.log('Error al eliminar cuota');
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
