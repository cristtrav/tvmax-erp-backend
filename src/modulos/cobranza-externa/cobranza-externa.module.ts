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
      VentaView
    ])
  ],
  providers: [
    CobranzaExternaService,
    FacturaElectronicaUtilsService,
    SifenApiUtilService,
    SifenUtilService,
    SifenEventosUtilService
  ],
  controllers: [CobranzaExternaController]
})
export class CobranzaExternaModule {}
