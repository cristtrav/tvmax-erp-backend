import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadoFacturaElectronicaService } from '../services/estado-factura-electronica.service';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('estadosfacturaselectronicas')
@UseGuards(LoginGuard, AllowedInGuard)
export class EstadoFacturaElectronicaController {

    constructor(
        private estadoDocumentoSifenSrv: EstadoFacturaElectronicaService
    ){}

    @Get()
    @AllowedIn(
        Permissions.ESTADOFACTURAELECTRONICA.CONSULTAR,
        Permissions.VENTAS.ACCESOMODULO
    )
    findAll(
        @Query() queries: QueriesType
    ): Promise<EstadoDocumentoSifen[]>{
        return this.estadoDocumentoSifenSrv.findAll(queries);
    }

    @Get('total')
    @AllowedIn(
        Permissions.ESTADOFACTURAELECTRONICA.CONSULTAR,
        Permissions.VENTAS.ACCESOMODULO
    )
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.estadoDocumentoSifenSrv.count(queries);
    }

}

type QueriesType = {[name: string]:any}
