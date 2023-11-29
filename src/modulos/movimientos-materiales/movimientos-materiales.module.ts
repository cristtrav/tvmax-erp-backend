import { Module } from '@nestjs/common';
import { MovimientosMaterialesService } from './movimientos-materiales.service';
import { MovimientosMaterialesController } from './movimientos-materiales.controller';
import { JwtModule } from '@nestjs/jwt';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoMaterial } from '@database/entity/movimiento-material.entity';
import { DetalleMovimientoMaterial } from '@database/entity/detalle-movimiento-material.entity';
import { Existencia } from '@database/entity/existencia.entity';
import { MovimientoMaterialView } from '@database/view/movimiento-material.view';
import { DetallesMovimientosMaterialesService } from './detalles-movimientos-materiales/detalles-movimientos-materiales.service';
import { DetallesMovimientosMaterialesController } from './detalles-movimientos-materiales/detalles-movimientos-materiales.controller';
import { DetalleMovimientoMaterialView } from '@database/view/detalle-movimiento-material.view';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([
      MovimientoMaterial,
      DetalleMovimientoMaterial,
      Existencia,
      MovimientoMaterialView,
      DetalleMovimientoMaterialView
    ])
  ],
  providers: [MovimientosMaterialesService, DetallesMovimientosMaterialesService],
  controllers: [MovimientosMaterialesController, DetallesMovimientosMaterialesController]
})
export class MovimientosMaterialesModule {}
