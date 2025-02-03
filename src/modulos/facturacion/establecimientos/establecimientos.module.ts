import { Module } from '@nestjs/common';
import { EstablecimientosService } from './establecimientos.service';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstablecimientosController } from './establecimientos.controller';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Establecimiento,
      Permiso
    ])
  ],
  providers: [EstablecimientosService, JwtUtilsService],
  exports: [EstablecimientosService],
  controllers: [EstablecimientosController]
})
export class EstablecimientosModule { }
