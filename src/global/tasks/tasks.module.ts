import { Cuota } from '@database/entity/cuota.entity';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotasScheduleService } from './cuotas-schedule/cuotas-schedule.service';
import { TimbradosTasksService } from './timbrados-tasks/timbrados-tasks.service';
import { Timbrado } from '@database/entity/timbrado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Suscripcion, Cuota, GeneracionCuotas, Timbrado])
  ],
  providers: [CuotasScheduleService, TimbradosTasksService]
})
export class TasksModule {}
