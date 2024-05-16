import { Module } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { ReclamosController } from './reclamos.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';
import { DetalleReclamo } from '@database/entity/reclamos/detalle-reclamo.entity';
import { ReclamoView } from '@database/view/reclamos/reclamo.view';
import { DetallesReclamosService } from './detalles-reclamos/detalles-reclamos.service';
import { DetalleReclamoView } from '@database/view/reclamos/detalle-reclamo.view';
import { Permiso } from '@database/entity/permiso.entity';
import { MaterialUtilizado } from '@database/entity/reclamos/material-utilzado.entity';
import { MaterialUtilizadoView } from '@database/view/reclamos/material-utilizado.view';
import { EventoCambioEstado } from '@database/entity/reclamos/evento-cambio-estado.entity';
import { EventosCambiosEstadosView } from '@database/view/reclamos/eventos-cambios-estados.view';
import { EventosCambiosEstadosService } from '../eventos-cambios-estados/eventos-cambios-estados.service';
import { ReiteracionService } from '../reiteracion/reiteracion.service';
import { ReiteracionView } from '@database/view/reclamos/reiteracion.view';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reclamo,
      DetalleReclamo,
      TablaAuditoria,
      ReclamoView,
      DetalleReclamoView,
      Permiso,
      MaterialUtilizado,
      MaterialUtilizadoView,
      EventoCambioEstado,
      EventosCambiosEstadosView,
      ReiteracionView
    ]),
    JwtModule.register({})
  ],
  providers: [
    ReclamosService,
    JwtUtilsService,
    DetallesReclamosService,
    EventosCambiosEstadosService,
    ReiteracionService
  ],
  controllers: [ReclamosController]
})
export class ReclamosModule {}
