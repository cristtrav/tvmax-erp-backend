import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { DatabaseService } from '@database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { ClientesService } from '../clientes/clientes.service';
import { UtilModule } from '@util/util.module';
import { ResumenVentasService } from './resumen-ventas/resumen-ventas.service';
import { ResumenVentasController } from './resumen-ventas/resumen-ventas.controller';
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
      Cuota, CobroCuotasView       
    ])
  ],
  providers: [VentasService, DatabaseService, ClientesService, ResumenVentasService, DetallesVentasService],
  controllers: [VentasController, ResumenVentasController, DetallesVentasController]
})
export class VentasModule {}
