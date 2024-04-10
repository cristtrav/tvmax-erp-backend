import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { MotivosService } from './motivos.service';
import { Motivo } from '@database/entity/reclamos/motivo.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { MotivoReclamoDTO } from '@dto/reclamos/motivo.dto';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('motivosreclamos')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class MotivosController {

    constructor(
        private motivosSrv: MotivosService,
        private jwtUtilSrv: JwtUtilsService,
    ){}

    @Get()
    @AllowedIn(
        Permissions.MOTIVOSRECLAMOS.CONSULTAR
    )
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<Motivo[]>{
        return this.motivosSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(
        Permissions.MOTIVOSRECLAMOS.CONSULTAR
    )
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.motivosSrv.count(queries);
    }

    @Get('ultimoid')
    @AllowedIn(
        Permissions.MOTIVOSRECLAMOS.ACCESOALFORMULARIO
    )
    getLastId(): Promise<number>{
        return this.motivosSrv.getLastId();
    }

    @Get(':id')
    @AllowedIn(
        Permissions.MOTIVOSRECLAMOS.ACCESOALFORMULARIO
    )
    findById(
        @Param('id') id: number
    ): Promise<MotivoReclamoDTO>{
        return this.motivosSrv.findById(id);
    }

    @Post()
    @AllowedIn(
        Permissions.MOTIVOSRECLAMOS.REGISTRAR
    )
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
    @AllowedIn(Permissions.MOTIVOSRECLAMOS.EDITAR)
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
    @AllowedIn(
        Permissions.MOTIVOSRECLAMOS.ELIMINAR
    )
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.motivosSrv.delete(id, this.jwtUtilSrv.extractJwtSub(auth));
    }

}

