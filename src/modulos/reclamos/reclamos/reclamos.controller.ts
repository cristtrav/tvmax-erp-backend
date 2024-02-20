import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Body, Controller, Headers, Post, UseFilters } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { ReclamoDTO } from '@dto/reclamos/reclamo.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { DetalleReclamo } from '@database/entity/reclamos/detalle-reclamo.entity';

@Controller('reclamos')
@UseFilters(HttpExceptionFilter)
export class ReclamosController {

    constructor(
        private reclamosSrv: ReclamosService,
        private jwtUtilsSrv: JwtUtilsService
    ){}

    @Post()
    async create(
        @Body() reclamoDto: ReclamoDTO,
        @Headers('authorization') auth: string
    ){
        console.log(reclamoDto);
        await this.reclamosSrv.create(
            new Reclamo().fromDTO(reclamoDto),
            reclamoDto.detalles.map(dDto => new DetalleReclamo().fromDTO(dDto)),
            this.jwtUtilsSrv.extractJwtSub(auth)
        );
    }
}
