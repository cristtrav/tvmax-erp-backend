import { Permissions } from '@auth/permission.list';
import { CuotaDTO } from 'src/global/dto/cuota.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Headers, UseFilters } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { CuotasService } from './cuotas.service';
import { CuotaView } from '@database/view/cuota.view';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('cuotas')
@UseGuards(LoginGuard)
@UseFilters(HttpExceptionFilter)
export class CuotasController {

    constructor(
        private cuotaSrv: CuotasService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get()
    async findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<CuotaView[]>{
        return this.cuotaSrv.findAll(queries);
    }

    @Get('total')
    async count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.cuotaSrv.count(queries);
    }

    @Get(':id')
    async findById(
        @Param('id') idc: number
    ): Promise<CuotaView>{
        return this.cuotaSrv.findById(idc);
    }

    @Get(':id/cobro')
    async findCobroCuota(
        @Param('id') idcuota: number
    ): Promise<CobroCuotasView>{
        return this.cuotaSrv.findCobro(idcuota);
    }

    @Post()
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
