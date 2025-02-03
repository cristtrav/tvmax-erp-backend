import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Delete, Headers, Param, UseFilters, UseGuards } from '@nestjs/common';
import { DeleteNotaCreditoService } from '../services/delete-nota-credito.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Controller('notascredito')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class DeleteNotaCreditoController {

    constructor(
        private jwtUtilSrv: JwtUtilsService,
        private deleteNotaCreditoSrv: DeleteNotaCreditoService
    ){}

    @Delete(':id')
    @AllowedIn(Permissions.NOTASCREDITO.ELIMINAR)
    async delete(
        @Headers('authorization') auth: string,
        @Param('id') id: number
    ){
        this.deleteNotaCreditoSrv.deleteNotaCredito(
            id,
            this.jwtUtilSrv.extractJwtSub(auth)
        );
    }

}
