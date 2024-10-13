import { Module } from '@nestjs/common';
import { ActividadEconomicaService } from './actividad-economica.service';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActividadEconomica
    ])
  ],
  providers: [ActividadEconomicaService],
  exports: [ActividadEconomicaService]
})
export class ActividadEconomicaModule {}
