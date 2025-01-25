import { Cuota } from '@database/entity/cuota.entity';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotasScheduleService } from './cuotas-schedule/cuotas-schedule.service';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { CuotasService } from '@modulos/cuotas/cuotas.service';
import { CuotaView } from '@database/view/cuota.view';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { EmailSenderTaskService } from './email-sender-task/email-sender-task.service';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { Venta } from '@database/entity/venta.entity';
import { FacturaElectronicaUtilsService } from '@modulos/ventas/service/factura-electronica-utils.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
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
import { DetalleLote } from '@database/entity/facturacion/lote-detalle.entity';
import { DetalleLoteView } from '@database/view/facturacion/detalle-lote.view';
import { ConsultaDTEMessageService } from '@modulos/sifen/consulta-dte/services/consulta-dte-message.service';

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
      DetalleLoteView
    ]),
  ],
  providers: [
    CuotasScheduleService,
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
    KudeUtilsService,
    ConsultaDTEMessageService
  ]
})
export class TasksModule {}
