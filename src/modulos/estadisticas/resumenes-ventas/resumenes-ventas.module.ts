import { Permiso } from '@database/entity/permiso.entity';
import { Venta } from '@database/entity/venta.entity';
import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { VentaView } from '@database/view/venta.view';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumenesVentasController } from './resumenes-ventas.controller';
import { ResumenesVentasService } from './resumenes-ventas.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Venta, VentaView, Permiso, DetalleVentaView])
  ],
  controllers: [ResumenesVentasController],
  providers: [ResumenesVentasService]
})
export class ResumenesVentasModule {}
