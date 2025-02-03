import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { LoginGuard } from '@auth/guards/login.guard';
import { Permissions } from '@auth/permission.list';
import { LoteView } from '@database/view/facturacion/lote.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { LoteDteService } from '@modulos/sifen/sifen-utils/services/lotes/lote-dte.service';
import { SifenApiUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-api-util.service';
import { Controller, Get, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { LoteDetalleView } from '@database/view/facturacion/lote-detalle.view';

@Controller('lotesfacturas')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class LoteDteController {

    constructor(
        private loteSifenSrv: LoteDteService,
        private sifenApiUtilsSrv: SifenApiUtilService
    ){}

    @Get()
    @AllowedIn(Permissions.LOTESFACTURAS.CONSULTAR)
    findAll(
        @Query() queries: QueriesType
    ): Promise<LoteView[]>{
        return this.loteSifenSrv.findAllView(queries);
    }

    @Get(':id/detalles')
    @AllowedIn(Permissions.LOTESFACTURAS.CONSULTAR)
    findAllDetalles(
        @Param('id') id: number
    ): Promise<LoteDetalleView[]>{
        return this.loteSifenSrv.findAllDetallesLotes(id, {});
    }

    @Get('total')
    @AllowedIn(Permissions.LOTESFACTURAS.CONSULTAR)
    count(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.loteSifenSrv.countView(queries);
    }

    @Get('generar')
    @AllowedIn(Permissions.LOTESFACTURAS.GENERAR)
    async generar(){
        const lotes = await this.loteSifenSrv.generarLotes();
        return { cantidad: lotes.length, resultado: `${lotes.length} lotes generados` };
    }

    @Get('enviar/:id')
    @AllowedIn(Permissions.LOTESFACTURAS.ENVIARSIFEN)
    async enviarPorId(
        @Param('id') id: number
    ){
        await this.sifenApiUtilsSrv.enviarLote(id);
        return { restultado: 'ok'}
    }

    @Get('consultar/:id')
    @AllowedIn(Permissions.LOTESFACTURAS.CONSULTARSIFEN)
    async consulta(
        @Param('id') id: number
    ){
        const lote = await this.loteSifenSrv.findById(id);
        const respuesta = await this.sifenApiUtilsSrv.consultarLote(lote);
        await this.loteSifenSrv.actualizarDatosConsulta(respuesta);
        return { resultado: respuesta.mensaje };
    }
}

type QueriesType = {[name: string]: any}
