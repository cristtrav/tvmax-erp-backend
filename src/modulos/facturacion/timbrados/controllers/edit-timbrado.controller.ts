import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Body, Controller, Headers, Param, Put, UseFilters, UseGuards } from '@nestjs/common';
import { EditTimbradoService } from '../services/edit-timbrado.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { TimbradoDTO } from '@dto/facturacion/timbrado.dto';
import { Timbrado } from '@database/entity/facturacion/timbrado.entity';

@Controller('timbrados')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class EditTimbradoController {

    constructor(
        private jwtUtilSrv: JwtUtilsService,
        private editTimbradoSrv: EditTimbradoService
    ){}

    @Put(':nrotimbrado')
    @AllowedIn(Permissions.TIMBRADOS.EDITAR)
    async put(
        @Headers('authorization') auth: string,
        @Body() timbradoDto: TimbradoDTO,
        @Param('nrotimbrado') nroTimbrado: number
    ){
        await this.editTimbradoSrv.edit(
            nroTimbrado,
            new Timbrado(timbradoDto),
            this.jwtUtilSrv.extractJwtSub(auth)
        );
    }

}
