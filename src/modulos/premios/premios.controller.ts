import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, UseFilters, UseGuards } from '@nestjs/common';
import { PremiosService } from './premios.service';
import { PremioDTO } from '@dto/premio.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { PremioView } from '@database/view/sorteos/premio.view';
import { AuthGuard } from '@auth/auth.guard';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('premios')
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
export class PremiosController {

    constructor(
        private premiosSrv: PremiosService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get('ultimoid')
    @RequirePermission(Permissions.PREMIOSSORTEOS.CONSULTARULTIMOID)
    getLastId(): Promise<number>{
        return this.premiosSrv.getLastId();
    }

    @Get(':id')
    @RequirePermission(Permissions.PREMIOSSORTEOS.CONSULTAR)
    findById(
        @Param('id') id: number
    ): Promise<PremioView>{
        return this.premiosSrv.findById(id);
    }

    @Post()
    @RequirePermission(Permissions.PREMIOSSORTEOS.REGISTRAR)
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
    @RequirePermission(Permissions.PREMIOSSORTEOS.EDITAR)
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
    @RequirePermission(Permissions.PREMIOSSORTEOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.premiosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

}
