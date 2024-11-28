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
import { EmailSenderTaskService } from './email-sender-task/email-sender-task.service';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { Venta } from '@database/entity/venta.entity';
import { FacturaElectronicaUtilsService } from '@modulos/ventas/service/factura-electronica-utils.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { TimbradoView } from '@database/view/timbrado.view';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { ClienteView } from '@database/view/cliente.view';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { VentaView } from '@database/view/venta.view';
import { SifenUtilService } from '@modulos/ventas/service/sifen-util.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Suscripcion,
      Cuota,
      GeneracionCuotas,
      Timbrado,
      CuotaView,
      CobroCuotasView,
      FacturaElectronica,
      VentaView,
      Venta,
      DatoContribuyente,
      ActividadEconomica,
      TimbradoView,
      Establecimiento,
      ClienteView,
      CodigoSeguridadContribuyente
    ]),
  ],
  providers: [
    CuotasScheduleService,
    TimbradosTasksService,
    CuotasService,
    EmailSenderTaskService,
    FacturaElectronicaUtilsService,
    SifenUtilService
  ]
})
export class TasksModule {}
