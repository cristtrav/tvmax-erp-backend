import { Body, Controller, Headers, Post, UseFilters, UseGuards } from '@nestjs/common';
import { SaveTimbradoService } from '../services/save-timbrado.service';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { TimbradoDTO } from '@dto/facturacion/timbrado.dto';
import { Timbrado } from '@database/entity/facturacion/timbrado.entity';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';

@Controller('timbrados')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class SaveTimbradoController {

    constructor(
        private jwtUtils: JwtUtilsService,
        private saveTimbradoSrv: SaveTimbradoService
    ){}

    @Post()
    @AllowedIn(Permissions.TIMBRADOS.REGISTRAR)
    async post(
        @Headers('authorization') auth: string,
        @Body() timbradoDto: TimbradoDTO
    ){
        await this.saveTimbradoSrv.save(
            this.jwtUtils.extractJwtSub(auth),
            new Timbrado(timbradoDto)
        );
    }

}
