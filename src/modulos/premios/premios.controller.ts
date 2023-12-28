import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, UseFilters } from '@nestjs/common';
import { PremiosService } from './premios.service';
import { PremioDTO } from '@dto/premio.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { PremioView } from '@database/view/sorteos/premio.view';

@Controller('premios')
@UseFilters(HttpExceptionFilter)
export class PremiosController {

    constructor(
        private premiosSrv: PremiosService,
        private jwtUtil: JwtUtilsService
    ){}

    @Get('ultimoid')
    getLastId(): Promise<number>{
        return this.premiosSrv.getLastId();
    }

    @Get(':id')
    findById(
        @Param('id') id: number
    ): Promise<PremioView>{
        return this.premiosSrv.findById(id);
    }

    @Post()
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
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.premiosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }

}
