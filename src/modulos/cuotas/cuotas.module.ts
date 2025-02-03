import { Module } from '@nestjs/common';
import { CuotasService } from './cuotas.service';
import { CuotasController } from './cuotas.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuota } from '@database/entity/cuota.entity';
import { CuotaView } from '@database/view/cuota.view';
import { Permiso } from '@database/entity/permiso.entity';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Cuota, CuotaView, CobroCuotasView, Permiso, GeneracionCuotas, Suscripcion])
  ],
  providers: [CuotasService, JwtUtilsService],
  controllers: [CuotasController],
  exports: [CuotasService]
})
export class CuotasModule { }
