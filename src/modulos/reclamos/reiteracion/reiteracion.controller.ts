import { Body, Controller, Delete, Headers, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ReiteracionService } from './reiteracion.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { ReiteracionDTO } from '@dto/reclamos/reiteracion.dto';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Reiteracion } from '@database/entity/reclamos/reiteracion.entity';

@Controller('reiteracionesreclamos')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class ReiteracionController {

    constructor(
        private reiteracionSrv: ReiteracionService,
        private jwtUtils: JwtUtilsService
    ){}

    @Post()
    @AllowedIn(Permissions.REITERACIONESRECLAMOS.REGISTRAR)
    async create(
        @Body() reiteracionDto: ReiteracionDTO,
        @Headers('authorization') auth: string
    ){
        await this.reiteracionSrv.create(new Reiteracion().fromDTO(reiteracionDto), this.jwtUtils.extractJwtSub(auth));
    }

    @Delete(':id')
    @AllowedIn(Permissions.REITERACIONESRECLAMOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.reiteracionSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }


}
