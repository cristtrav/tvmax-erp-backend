import { Module } from '@nestjs/common';
import { CobrosService } from './cobros.service';
import { CobrosController } from './cobros.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CobroDetalleVentaView } from '@database/view/cobro-detalle-venta.view';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      CobroDetalleVentaView,
      Permiso
    ])
  ],
  providers: [CobrosService],
  controllers: [CobrosController]
})
export class CobrosModule {}
