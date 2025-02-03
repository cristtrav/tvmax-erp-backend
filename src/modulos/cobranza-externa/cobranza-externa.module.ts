import { Module } from '@nestjs/common';
import { CobranzaExternaService } from './cobranza-externa.service';
import { CobranzaExternaController } from './cobranza-externa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '@database/entity/usuario.entity';
import { Cliente } from '@database/entity/cliente.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { CuotaView } from '@database/view/cuota.view';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { ClienteView } from '@database/view/cliente.view';
import { DetalleConsultaCobranzaExterna } from '@database/entity/detalle-consulta-cobranza-externa.entity';
import { ConsultaCobranzaExterna } from '@database/entity/consulta-cobranza-externa.entity';
import { Cobro } from '@database/entity/cobro.entity';
import { Venta } from '@database/entity/venta.entity';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { VentaView } from '@database/view/venta.view';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { DetalleLote } from '@database/entity/facturacion/lote-detalle.entity';
import { SifenUtilsModule } from '@modulos/sifen/sifen-utils/sifen-utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Cliente,
      ClienteView,
      Suscripcion,
      SuscripcionView,
      CuotaView,
      Cuota,
      DetalleConsultaCobranzaExterna,
      ConsultaCobranzaExterna,
      Cobro,
      Venta,
      Talonario,
      DatoContribuyente,
      ActividadEconomica,
      TalonarioView,
      Establecimiento,
      CodigoSeguridadContribuyente,
      DTE,
      EstadoDocumentoSifen,
      VentaView,
      Lote,
      DetalleLote
    ]),
    SifenUtilsModule
  ],
  providers: [
    CobranzaExternaService,
    /*FacturaElectronicaUtilsService,
    SifenApiUtilService,
    SifenUtilService,
    SifenEventosUtilService,
    SifenLoteMessageService,
    ConsultaRucService,
    ConsultaRucMessageService,
    KudeUtilsService,
    DteUtilsService*/
  ],
  controllers: [CobranzaExternaController]
})
export class CobranzaExternaModule {}
