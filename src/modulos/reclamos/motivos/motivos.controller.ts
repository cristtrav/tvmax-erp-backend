import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Header, Headers, HttpException, HttpStatus, Param, Post, Put, Query, UseFilters } from '@nestjs/common';
import { MotivosService } from './motivos.service';
import { Motivo } from '@database/entity/reclamos/motivo.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { MotivoReclamoDTO } from '@dto/reclamos/motivo.dto';

@Controller('motivosreclamos')
@UseFilters(HttpExceptionFilter)
export class MotivosController {

    constructor(
        private motivosSrv: MotivosService,
        private jwtUtilSrv: JwtUtilsService
    ){}

    @Get()
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<Motivo[]>{
        /*throw new HttpException({
            message: 'Error de prueba'
        }, HttpStatus.I_AM_A_TEAPOT);*/
        return this.motivosSrv.findAll(queries);
    }

    @Get('total')
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.motivosSrv.count(queries);
    }

    @Get('ultimoid')
    getLastId(): Promise<number>{
        return this.motivosSrv.getLastId();
    }

    @Get(':id')
    findById(
        @Param('id') id: number
    ): Promise<MotivoReclamoDTO>{
        return this.motivosSrv.findById(id);
    }

    @Post()
    async create(
        @Body() motivoDto: MotivoReclamoDTO,
        @Headers('authorization') auth: string
    ){
        await this.motivosSrv.create(
            new Motivo().fromDTO(motivoDto),
            this.jwtUtilSrv.extractJwtSub(auth)
        );
    }

    @Put(':id')
    async update(
        @Param('id') oldId: number,
        @Body() motivoDto: MotivoReclamoDTO,
        @Headers('authorization') auth: string
    ){
        await this.motivosSrv.update(
            oldId,
            new Motivo().fromDTO(motivoDto),
            this.jwtUtilSrv.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.motivosSrv.delete(id, this.jwtUtilSrv.extractJwtSub(auth));
    }

}

