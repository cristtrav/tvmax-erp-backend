import { Module } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionesController } from './suscripciones.controller';
import { DatabaseService } from '../../global/database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { CuotasService } from '../cuotas/cuotas.service';
import { ServiciosService } from '../servicios/servicios.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [SuscripcionesService, DatabaseService, CuotasService, ServiciosService],
  controllers: [SuscripcionesController]
})
export class SuscripcionesModule {}
