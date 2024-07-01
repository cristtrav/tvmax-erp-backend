import { Module } from '@nestjs/common';
import { TributacionController } from './tributacion.controller';
import { TributacionService } from './tributacion.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaView } from '@database/view/venta.view';
import { Venta } from '@database/entity/venta.entity';
import { VentaTributacionExpView } from '@database/view/venta-tributacion-exp.view';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Venta,
      VentaView,
      VentaTributacionExpView,
      Permiso
    ])
  ],
  controllers: [TributacionController],
  providers: [TributacionService, JwtUtilsService]
})
export class TributacionModule {}
