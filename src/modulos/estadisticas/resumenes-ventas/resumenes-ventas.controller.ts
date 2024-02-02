import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { ResumenCobradoresVentasDTO } from 'src/global/dto/resumen-cobradores-ventas.dto';
import { ResumenGruposVentasDTO } from 'src/global/dto/resumen-grupos-ventas.dto';
import { ResumenServiciosVentasDTO } from 'src/global/dto/resumen-servicios-ventas.dto';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ResumenesVentasService } from './resumenes-ventas.service';

@Controller('ventas/resumen')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class ResumenesVentasController {

    constructor(
        private resumenesVentasSrv: ResumenesVentasService
    ) { }

    @Get('monto')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    getMontoTotal(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.resumenesVentasSrv.getMonto(queries);
    }

    @Get('grupos')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    getResumenGrupos(
        @Query() queries: { [name: string]: any }
    ): Promise<ResumenGruposVentasDTO[]> {
        return this.resumenesVentasSrv.findAllResumenGruposVentas(queries);
    }

    @Get('grupos/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    getTotalResumenGrupos(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.resumenesVentasSrv.countResumenGruposVentas(queries);
    }

    @Get('servicios')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    getResumenServicios(
        @Query() queries: { [name: string]: any }
    ): Promise<ResumenServiciosVentasDTO[]> {
        return this.resumenesVentasSrv.findAllResumenServiciosVentas(queries);
    }

    @Get('servicios/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    getTotalResumenServicios(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.resumenesVentasSrv.countResumenServiciosVentas(queries);
    }

    @Get('cobradores')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    getResumenCobradores(
        @Query() queries: { [name: string]: any }
    ): Promise<ResumenCobradoresVentasDTO[]> {
        return this.resumenesVentasSrv.findAllResumenCobradores(queries);
    }

    @Get('cobradores/total')
    @RequirePermission(Permissions.ESTADISTICAS.CONSULTARVENTAS)
    getTotalResumenCobradores(
        @Query() queries: { [name: string]: any }
    ): Promise<number> {
        return this.resumenesVentasSrv.countResumenCobradores(queries);
    }


}
