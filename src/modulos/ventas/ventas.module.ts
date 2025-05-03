import { Module } from '@nestjs/common';
import { VentasService } from './service/ventas.service';
import { VentasController } from './controller/ventas.controller';
import { JwtModule } from '@nestjs/jwt';
import { DetallesVentasService } from './service/detalles-ventas.service';
import { DetallesVentasController } from './controller/detalles-ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteView } from '@database/view/cliente.view';
import { Cliente } from '@database/entity/cliente.entity';
import { Permiso } from '@database/entity/permiso.entity';
import { Venta } from '@database/entity/venta.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { VentaView } from '@database/view/venta.view';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { Cobro } from '@database/entity/cobro.entity';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { DTECancelacion } from '@database/entity/facturacion/dte-cancelacion.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { DteView } from '@database/view/facturacion/dte.view';
import { DetalleLote } from '@database/entity/facturacion/lote-detalle.entity';
import { CancelarVentaService } from './service/cancelar-venta.service';
import { AnularVentaService } from './service/anular-venta.service';
import { AnularVentaController } from './controller/anular-venta.controller';
import { CancelarVentaController } from './controller/cancelar-venta.controller';
import { AnularVentaNotacreditoController } from './controller/anular-venta-notacredito.controller';
import { AnularVentaNotacreditoService } from './service/anular-venta-notacredito.service';
import { SifenUtilsModule } from '@modulos/sifen/sifen-utils/sifen-utils.module';
import { UtilModule } from '@globalutil/util.module';
import { FacturaElectronicaModule } from '@modulos/facturacion/factura-electronica/factura-electronica.module';
import { NotaCreditoView } from '@database/view/facturacion/nota-credito.view';
import { UtilVentaService } from './service/util-venta.service';
import { CrearVentaService } from './service/crear-venta.service';
import { EditarVentaService } from './service/editar-venta.service';
import { EliminarVentaService } from './service/eliminar-venta.service';
import { ClientesModule } from '@modulos/clientes/clientes.module';

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
      Talonario,
      TalonarioView,
      Cuota, CobroCuotasView,
      Cobro,
      DatoContribuyente,
      ActividadEconomica,
      Establecimiento,
      DTE,
      CodigoSeguridadContribuyente,
      DTECancelacion,
      EstadoDocumentoSifen,
      Lote,
      DteView,
      DetalleLote,
      NotaCreditoView
    ]),
    SifenUtilsModule,
    UtilModule,
    FacturaElectronicaModule,
    ClientesModule
  ],
  providers: [
    VentasService,
    DetallesVentasService,
    CancelarVentaService,
    AnularVentaService,
    AnularVentaNotacreditoService,
    UtilVentaService,
    CrearVentaService,
    EditarVentaService,
    EliminarVentaService
  ],
  controllers: [
    VentasController,
    DetallesVentasController,
    AnularVentaController,
    CancelarVentaController,
    AnularVentaNotacreditoController
  ]
})
export class VentasModule {}
