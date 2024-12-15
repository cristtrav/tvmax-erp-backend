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
import { Timbrado } from '@database/entity/timbrado.entity';
import { FacturaElectronicaUtilsService } from '@modulos/ventas/service/factura-electronica-utils.service';
import { SifenApiUtilService } from '@modulos/ventas/service/sifen-api-util.service';
import { SifenUtilService } from '@modulos/ventas/service/sifen-util.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { TimbradoView } from '@database/view/timbrado.view';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { SifenEventosUtilService } from '@modulos/ventas/service/sifen-eventos-util.service';
import { VentaView } from '@database/view/venta.view';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { SifenLoteMessageService } from '@modulos/sifen/lote-sifen/services/sifen-lote-message.service';
import { ConsultaRucService } from '@modulos/sifen/consulta-ruc/services/consulta-ruc.service';
import { ConsultaRucMessageService } from '@modulos/sifen/consulta-ruc/services/consulta-ruc-message.service';
import { KudeUtilsService } from '@globalutil/kude-utils.service';
import { DetalleLote } from '@database/entity/facturacion/detalle-lote.entity';
import { ConsultaDTEMessageService } from '@modulos/sifen/consulta-dte/services/consulta-dte-message.service';

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
      Timbrado,
      DatoContribuyente,
      ActividadEconomica,
      TimbradoView,
      Establecimiento,
      CodigoSeguridadContribuyente,
      FacturaElectronica,
      EstadoDocumentoSifen,
      VentaView,
      Lote,
      DetalleLote
    ])
  ],
  providers: [
    CobranzaExternaService,
    FacturaElectronicaUtilsService,
    SifenApiUtilService,
    SifenUtilService,
    SifenEventosUtilService,
    SifenLoteMessageService,
    ConsultaRucService,
    ConsultaRucMessageService,
    KudeUtilsService,
    ConsultaDTEMessageService
  ],
  controllers: [CobranzaExternaController]
})
export class CobranzaExternaModule {}
