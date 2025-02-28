import { LoginGuard } from '@auth/guards/login.guard';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Param, UseFilters, UseGuards } from '@nestjs/common';
import { CuotasGruposBySuscripcionService } from '../service/cuotas-grupos-by-suscripcion.service';
import { CuotaGrupoView } from '@database/view/cuota-grupo.view';

@Controller('suscripciones')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard)
export class CuotasGruposController {

    constructor(
        private gruposCuotasBySuscripcionSrv: CuotasGruposBySuscripcionService
    ){}

    @Get(':idsuscripcion/gruposcuotas')
    findGruposCuotasBySuscripcion(
        @Param('idsuscripcion') idsuscripcion: number
    ): Promise<CuotaGrupoView[]>{
        return this.gruposCuotasBySuscripcionSrv.findBySuscripcion(idsuscripcion);
    }
    
}
