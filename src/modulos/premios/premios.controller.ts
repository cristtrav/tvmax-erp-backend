import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, UseFilters, UseGuards } from '@nestjs/common';
import { PremiosService } from './premios.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { PremioView } from '@database/view/sorteos/premio.view';
import { Permissions } from '@auth/permission.list';
import { PremioDTO } from '@dto/sorteos/premio.dto';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('premios')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class PremiosController {

    constructor(
        private premiosSrv: PremiosService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get('ultimoid')
    @AllowedIn(Permissions.PREMIOSSORTEOS.ACCESOFORMULARIO)
    getLastId(): Promise<number>{
        return this.premiosSrv.getLastId();
    }

    @Get(':id')
    @AllowedIn(Permissions.PREMIOSSORTEOS.ACCESOFORMULARIO)
    findById(
        @Param('id') id: number
    ): Promise<PremioView>{
        return this.premiosSrv.findById(id);
    }

    @Post()
    @AllowedIn(Permissions.PREMIOSSORTEOS.REGISTRAR)
    async create(
        @Body() premioDto: PremioDTO,
        @Headers('authorization') auth: string
    ){
        await this.premiosSrv.create(
            DTOEntityUtis.premioDtoToEntity(premioDto),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @AllowedIn(
        Permissions.PREMIOSSORTEOS.EDITAR,
        Permissions.SORTEOS.REALIZARSORTEO
    )
    async update(
        @Param('id') oldId: number,
        @Body() premioDto: PremioDTO,
        @Headers('authorization') auth: string
    ){
        await this.premiosSrv.update(
            oldId,
            DTOEntityUtis.premioDtoToEntity(premioDto),
            this.jwtUtil.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @AllowedIn(Permissions.PREMIOSSORTEOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.premiosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

}
