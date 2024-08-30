import { Cuota } from '@database/entity/cuota.entity';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotasScheduleService } from './cuotas-schedule/cuotas-schedule.service';
import { TimbradosTasksService } from './timbrados-tasks/timbrados-tasks.service';
import { Timbrado } from '@database/entity/timbrado.entity';
import { CuotasService } from '@modulos/cuotas/cuotas.service';
import { CuotaView } from '@database/view/cuota.view';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Suscripcion,
      Cuota,
      GeneracionCuotas,
      Timbrado,
      CuotaView,
      CobroCuotasView
    ]),
  ],
  providers: [CuotasScheduleService, TimbradosTasksService, CuotasService]
})
export class TasksModule {}
