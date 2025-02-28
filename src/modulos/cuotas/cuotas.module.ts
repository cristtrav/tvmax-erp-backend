import { Module } from '@nestjs/common';
import { CuotasService } from './service/cuotas.service';
import { CuotasController } from './controller/cuotas.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuota } from '@database/entity/cuota.entity';
import { CuotaView } from '@database/view/cuota.view';
import { Permiso } from '@database/entity/permiso.entity';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { CuotaGrupo } from '@database/entity/cuota-grupo.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Cuota,
      CuotaView,
      CobroCuotasView,
      Permiso, 
      GeneracionCuotas,
      Suscripcion,
      CuotaGrupo
    ])
  ],
  providers: [CuotasService, JwtUtilsService],
  controllers: [CuotasController],
  exports: [CuotasService]
})
export class CuotasModule { }
