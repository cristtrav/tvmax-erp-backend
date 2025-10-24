import { Module } from '@nestjs/common';
import { GenerarDteLotesController } from './generar-dte-lotes.controller';
import { GenerarDteLotesService } from './generar-dte-lotes.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaView } from '@database/view/venta.view';
import { Venta } from '@database/entity/venta.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { SifenUtilsModule } from '@modulos/sifen/sifen-utils/sifen-utils.module';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      VentaView,
      Venta,
      DetalleVenta,
      DTE
    ]),
    SifenUtilsModule
  ],
  controllers: [GenerarDteLotesController],
  providers: [GenerarDteLotesService]
})
export class GenerarDteLotesModule {}
