import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Get, Headers, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { CuotasGruposService } from '../service/cuotas-grupos.service';
import { CuotaGrupoView } from '@database/view/cuota-grupo.view';
import { CuotaGrupoDTO } from '@dto/cuota-grupo.dto';
import { CuotaGrupo } from '@database/entity/cuota-grupo.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('gruposcuotas')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class CuotasGruposController {

    constructor(
        private jwtUtilSrv: JwtUtilsService,
        private cuotasGruposSrv: CuotasGruposService
    ){}

    @Get()
    @AllowedIn(Permissions.CUOTAS.CONSULTAR)
    async findAll(
        @Query() queries: QueriesType
    ): Promise<CuotaGrupoView[]>{
        return this.cuotasGruposSrv.findAll(queries)
    }

    @Post()
    @AllowedIn(Permissions.CUOTAS.REGISTRAR)
    async create(
        @Body() cuotaGrupoDto: CuotaGrupoDTO,
        @Headers('authorization') auth: string
    ): Promise<CuotaGrupoDTO>{
        return (await this.cuotasGruposSrv.create(
            new CuotaGrupo(cuotaGrupoDto),
            this.jwtUtilSrv.extractJwtSub(auth)
        )).toDTO();
    }
}

type QueriesType = {[name: string]: any}
