import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { JwtModule } from '@nestjs/jwt';
import { ClientesService } from '../clientes/clientes.service';
import { UtilModule } from '@util/util.module';
import { DetallesVentasService } from './detalles-ventas/detalles-ventas.service';
import { DetallesVentasController } from './detalles-ventas/detalles-ventas.controller';
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

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([
      Cliente,
      ClienteView,
      Permiso,
      Venta,
      VentaView,
      DetalleVenta, DetalleVentaView,
      Timbrado,
      Cuota, CobroCuotasView,
      Cobro
    ])
  ],
  providers: [VentasService, ClientesService, DetallesVentasService],
  controllers: [VentasController, DetallesVentasController]
})
export class VentasModule {}
