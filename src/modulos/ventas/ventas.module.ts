import { Module } from '@nestjs/common';
import { VentasService } from './service/ventas.service';
import { VentasController } from './controller/ventas.controller';
import { JwtModule } from '@nestjs/jwt';
import { ClientesService } from '../clientes/service/clientes.service';
import { DetallesVentasService } from './service/detalles-ventas.service';
import { DetallesVentasController } from './controller/detalles-ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteView } from '@database/view/cliente.view';
import { Cliente } from '@database/entity/cliente.entity';
import { Permiso } from '@database/entity/permiso.entity';
import { Venta } from '@database/entity/venta.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { VentaView } from '@database/view/venta.view';
import { Timbrado } from '@database/entity/timbrado.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { Cobro } from '@database/entity/cobro.entity';
import { FacturaElectronicaUtilsService } from './service/factura-electronica-utils.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { TimbradoView } from '@database/view/timbrado.view';
import { FacturaElectronicaService } from '@modulos/facturacion/factura-electronica/services/factura-electronica.service';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { SifenApiUtilService } from './service/sifen-api-util.service';
import { CancelacionFactura } from '@database/entity/facturacion/cancelacion-factura.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { SifenUtilService } from './service/sifen-util.service';
import { SifenEventosUtilService } from './service/sifen-eventos-util.service';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { SifenLoteMessageService } from '@modulos/sifen/lote-sifen/services/sifen-lote-message.service';
import { FacturaElectronicaView } from '@database/view/facturacion/factura-electronica.view';
import { ConsultaRucService } from '@modulos/sifen/consulta-ruc/services/consulta-ruc.service';
import { ConsultaRucMessageService } from '@modulos/sifen/consulta-ruc/services/consulta-ruc-message.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { DigitoVerificadorRucService } from '@globalutil/digito-verificador-ruc.service';
import { KudeUtilsService } from '@globalutil/kude-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Cliente,
      ClienteView,
      Permiso,
      Venta,
      VentaView,
      DetalleVenta, DetalleVentaView,
      Timbrado,
      TimbradoView,
      Cuota, CobroCuotasView,
      Cobro,
      DatoContribuyente,
      ActividadEconomica,
      Establecimiento,
      FacturaElectronica,
      CodigoSeguridadContribuyente,
      CancelacionFactura,
      EstadoDocumentoSifen,
      Lote,
      FacturaElectronicaView
    ])
  ],
  providers: [
    VentasService,
    ClientesService,
    DetallesVentasService,
    FacturaElectronicaUtilsService,
    FacturaElectronicaService,
    SifenApiUtilService,
    SifenUtilService,
    SifenEventosUtilService,
    SifenLoteMessageService,
    ConsultaRucService,
    ConsultaRucMessageService,
    JwtUtilsService,
    DigitoVerificadorRucService,
    KudeUtilsService
  ],
  controllers: [VentasController, DetallesVentasController]
})
export class VentasModule {}
