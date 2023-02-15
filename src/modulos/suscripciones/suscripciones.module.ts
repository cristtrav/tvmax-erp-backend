import { Module } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionesController } from './suscripciones.controller';
import { JwtModule } from '@nestjs/jwt';
import { CuotasService } from '../cuotas/cuotas.service';
import { ServiciosService } from '../servicios/servicios.service';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from '@database/entity/servicio.entity';
import { ServicioView } from '@database/view/servicio.view';
import { CuotaView } from '@database/view/cuota.view';
import { Cuota } from '@database/entity/cuota.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { Permiso } from '@database/entity/permiso.entity';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Servicio,
      ServicioView,
      Cuota,
      CuotaView,
      CobroCuotasView,
      Suscripcion,
      SuscripcionView,
      Permiso
    ]),
    UtilModule
  ],
  providers: [
    SuscripcionesService,    
    CuotasService,
    ServiciosService
  ],
  controllers: [SuscripcionesController],
  exports: [ServiciosService]
})
export class SuscripcionesModule {}
