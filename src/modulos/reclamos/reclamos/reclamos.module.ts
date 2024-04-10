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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reclamo,
      DetalleReclamo,
      TablaAuditoria,
      ReclamoView,
      DetalleReclamoView,
      Permiso
    ]),
    JwtModule.register({})
  ],
  providers: [ReclamosService, JwtUtilsService, DetallesReclamosService],
  controllers: [ReclamosController]
})
export class ReclamosModule {}
