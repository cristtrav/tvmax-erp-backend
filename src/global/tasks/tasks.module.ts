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
import { SifenTaskService } from './sifen-task/sifen-task.service';
import { LoteSifenService } from '@modulos/sifen/lote-sifen/services/lote-sifen.service';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { SifenApiUtilService } from '@modulos/ventas/service/sifen-api-util.service';
import { SifenLoteMessageService } from '@modulos/sifen/lote-sifen/services/sifen-lote-message.service';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { ConsultaRucController } from '@modulos/sifen/consulta-ruc/controller/consulta-ruc.controller';
import { ConsultaRucService } from '@modulos/sifen/consulta-ruc/services/consulta-ruc.service';
import { ConsultaRucMessageService } from '@modulos/sifen/consulta-ruc/services/consulta-ruc-message.service';
import { LoteView } from '@database/view/facturacion/lote.view';
import { KudeUtilsService } from '@globalutil/kude-utils.service';
import { DetalleLote } from '@database/entity/facturacion/detalle-lote.entity';

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
      CodigoSeguridadContribuyente,
      Lote,
      LoteView,
      EstadoDocumentoSifen,
      DetalleLote
    ]),
  ],
  providers: [
    CuotasScheduleService,
    TimbradosTasksService,
    CuotasService,
    EmailSenderTaskService,
    FacturaElectronicaUtilsService,
    SifenUtilService,
    SifenTaskService,
    LoteSifenService,
    SifenApiUtilService,
    SifenLoteMessageService,
    ConsultaRucService,
    ConsultaRucMessageService,
    KudeUtilsService
  ]
})
export class TasksModule {}
