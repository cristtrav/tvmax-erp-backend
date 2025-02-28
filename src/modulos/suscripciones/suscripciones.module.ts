import { Module } from '@nestjs/common';
import { SuscripcionesService } from './service/suscripciones.service';
import { SuscripcionesController } from './controller/suscripciones.controller';
import { JwtModule } from '@nestjs/jwt';
import { CuotasService } from '../cuotas/service/cuotas.service';
import { ServiciosService } from '../servicios/servicios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from '@database/entity/servicio.entity';
import { ServicioView } from '@database/view/servicio.view';
import { CuotaView } from '@database/view/cuota.view';
import { Cuota } from '@database/entity/cuota.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { Permiso } from '@database/entity/permiso.entity';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { CuotasGruposController } from './controller/cuotas-grupos-by-suscripcion.controller';
import { CuotasGruposBySuscripcionService } from './service/cuotas-grupos-by-suscripcion.service';
import { CuotaGrupo } from '@database/entity/cuota-grupo.entity';
import { CuotaGrupoView } from '@database/view/cuota-grupo.view';

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
      Permiso,
      GeneracionCuotas,
      CuotaGrupo,
      CuotaGrupoView
    ])
  ],
  providers: [
    SuscripcionesService,    
    CuotasService,
    ServiciosService,
    JwtUtilsService,
    CuotasGruposBySuscripcionService
  ],
  controllers: [SuscripcionesController, CuotasGruposController],
  exports: [ServiciosService]
})
export class SuscripcionesModule {}
