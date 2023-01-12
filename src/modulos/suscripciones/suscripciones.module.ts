import { Module } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionesController } from './suscripciones.controller';
import { DatabaseService } from '../../global/database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { CuotasService } from '../cuotas/cuotas.service';
import { ServiciosService } from '../servicios/servicios.service';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from '@database/entity/servicio.entity';
import { ServicioView } from '@database/view/servicio.view';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Servicio, ServicioView]),
    UtilModule
  ],
  providers: [SuscripcionesService, DatabaseService, CuotasService, ServiciosService],
  controllers: [SuscripcionesController],
  exports: [ServiciosService]
})
export class SuscripcionesModule {}
