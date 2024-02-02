import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { CuotaDTO } from 'src/global/dto/cuota.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Headers, UseFilters } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { CuotasService } from './cuotas.service';
import { CuotaView } from '@database/view/cuota.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';

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
    ): Promise<CobroCuotasView>{
        return this.cuotaSrv.findCobro(idcuota);
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
