import { Module } from '@nestjs/common';
import { MovimientosMaterialesService } from './movimientos-materiales.service';
import { MovimientosMaterialesController } from './movimientos-materiales.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallesMovimientosMaterialesService } from './detalles-movimientos-materiales/detalles-movimientos-materiales.service';
import { DetallesMovimientosMaterialesController } from './detalles-movimientos-materiales/detalles-movimientos-materiales.controller';
import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MovimientoMaterial } from '@database/entity/depositos/movimiento-material.entity';
import { DetalleMovimientoMaterialView } from '@database/view/depositos/detalle-movimiento-material.view';
import { MovimientoMaterialView } from '@database/view/depositos/movimiento-material.view';
import { Material } from '@database/entity/depositos/material.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      MovimientoMaterial,
      DetalleMovimientoMaterial,
      Existencia,
      MovimientoMaterialView,
      DetalleMovimientoMaterialView,
      Material, MaterialIdentificable,
      Permiso
    ])
  ],
  providers: [
    MovimientosMaterialesService,
    DetallesMovimientosMaterialesService,
    JwtUtilsService
  ],
  controllers: [MovimientosMaterialesController, DetallesMovimientosMaterialesController]
})
export class MovimientosMaterialesModule {}
