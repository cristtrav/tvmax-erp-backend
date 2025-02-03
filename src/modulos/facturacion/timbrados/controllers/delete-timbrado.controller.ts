import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Controller, Delete, Headers, Param, UseFilters, UseGuards } from '@nestjs/common';
import { DeleteTimbradoService } from '../services/delete-timbrado.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('timbrados')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class DeleteTimbradoController {

    constructor(
        private jwtUtilsSrv: JwtUtilsService,
        private deleteTimbradoSrv: DeleteTimbradoService
    ){}

    @Delete(':nrotimbrado')
    @AllowedIn(Permissions.TIMBRADOS.ELIMINAR)
    async delete(
        @Headers('authorization') auth: string,
        @Param('nrotimbrado') nrotimbrado: number
    ){
        await this.deleteTimbradoSrv.delete(
            nrotimbrado,
            this.jwtUtilsSrv.extractJwtSub(auth)
        );
    }
    
}
