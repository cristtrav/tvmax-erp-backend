import { Cuota } from '@database/entity/cuota.entity';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotasScheduleService } from './cuotas-schedule/cuotas-schedule.service';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { CuotaView } from '@database/view/cuota.view';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { EmailSenderTaskService } from './email-sender-task/email-sender-task.service';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { Venta } from '@database/entity/venta.entity';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { ClienteView } from '@database/view/cliente.view';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { VentaView } from '@database/view/venta.view';
import { SifenTaskService } from './sifen-task/sifen-task.service';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { LoteView } from '@database/view/facturacion/lote.view';
import { DetalleLote } from '@database/entity/facturacion/lote-detalle.entity';
import { LoteDetalleView } from '@database/view/facturacion/lote-detalle.view';

import { SifenUtilsModule } from '@modulos/sifen/sifen-utils/sifen-utils.module';
import { CuotasModule } from '@modulos/cuotas/cuotas.module';
import { EmailVerifierTaskService } from './email-verifier-task/email-verifier-task.service';
import { EmailDesactivado } from '@database/entity/facturacion/email-desactivado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Suscripcion,
      Cuota,
      GeneracionCuotas,
      Talonario,
      CuotaView,
      CobroCuotasView,
      DTE,
      VentaView,
      Venta,
      DatoContribuyente,
      ActividadEconomica,
      TalonarioView,
      Establecimiento,
      ClienteView,
      CodigoSeguridadContribuyente,
      Lote,
      LoteView,
      EstadoDocumentoSifen,
      DetalleLote,
      LoteDetalleView,
      EmailDesactivado
    ]),
    SifenUtilsModule,
    CuotasModule
  ],
  providers: [
    SifenTaskService,
    EmailSenderTaskService,
    CuotasScheduleService,
    EmailVerifierTaskService,
  ]
})
export class TasksModule {}
