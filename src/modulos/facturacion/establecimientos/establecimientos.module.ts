import { Module } from '@nestjs/common';
import { EstablecimientosService } from './establecimientos.service';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Establecimiento
    ])
  ],
  providers: [EstablecimientosService],
  exports: [EstablecimientosService]
})
export class EstablecimientosModule { }
