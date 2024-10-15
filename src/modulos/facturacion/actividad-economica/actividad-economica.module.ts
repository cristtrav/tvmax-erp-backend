import { Module } from '@nestjs/common';
import { ActividadEconomicaService } from './actividad-economica.service';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadEconomicaController } from './actividad-economica.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      ActividadEconomica
    ])
  ],
  providers: [ActividadEconomicaService, JwtUtilsService],
  exports: [ActividadEconomicaService],
  controllers: [ActividadEconomicaController]
})
export class ActividadEconomicaModule {}
