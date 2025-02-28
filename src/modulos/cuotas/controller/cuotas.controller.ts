import { Permissions } from '@auth/permission.list';
import { CuotaDTO } from 'src/global/dto/cuota.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Headers, UseFilters } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { CuotasService } from '../service/cuotas.service';
import { CuotaView } from '@database/view/cuota.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { ResultadoGeneracionCuotaDTO } from '../dto/resultado-generacion-cuota.dto';

@Controller('cuotas')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class CuotasController {

    constructor(
        private cuotaSrv: CuotasService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(
        Permissions.POS.ACCESOMODULO,
        Permissions.POSMOVIL.ACCESOMODULO,
        Permissions.CUOTAS.CONSULTAR
    )
    async findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<CuotaView[]>{
        return this.cuotaSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(Permissions.CUOTAS.CONSULTAR)
    async count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.cuotaSrv.count(queries);
    }

    @Get(':id')
    @AllowedIn(Permissions.CUOTAS.ACCESOFORMULARIO)
    async findById(
        @Param('id') idc: number
    ): Promise<CuotaView>{
        return this.cuotaSrv.findById(idc);
    }

    @Get(':id/cobro')
    @AllowedIn(
        Permissions.CUOTAS.ACCESOFORMULARIO,
        Permissions.CUOTAS.CONSULTAR
    )
    async findCobroCuota(
        @Param('id') idcuota: number
    ): Promise<CobroCuotasView>{
        return this.cuotaSrv.findCobro(idcuota);
    }

    @Post()
    @AllowedIn(Permissions.CUOTAS.REGISTRAR)
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
    @AllowedIn(Permissions.CUOTAS.EDITAR)
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
    @AllowedIn(Permissions.CUOTAS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.cuotaSrv.delete(
            id,
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Post('generar')
    @AllowedIn(Permissions.CUOTAS.GENERARCUOTASMES)
    async generar(
        @Body() body: { anio: number, mes: number }
    ){
        this.cuotaSrv.generarCuotas(body.mes, body.anio);
    }

    @Post('generarsuscripcion')
    @AllowedIn(Permissions.CUOTAS.REGISTRAR)
    async generarSuscripcion(
        @Headers('authorization') auth: string,
        @Body() cuotaDto: CuotaDTO,
    ): Promise<ResultadoGeneracionCuotaDTO>{
        return await this.cuotaSrv.generarCuotasSuscripcion(
            cuotaDto.cantidad,
            DTOEntityUtis.cuotaDtoToEntity(cuotaDto),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

}
