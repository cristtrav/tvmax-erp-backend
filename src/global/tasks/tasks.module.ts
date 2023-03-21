import { Cuota } from '@database/entity/cuota.entity';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotasScheduleService } from './cuotas-schedule/cuotas-schedule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Suscripcion, Cuota, GeneracionCuotas])
  ],
  providers: [CuotasScheduleService]
})
export class TasksModule {}
