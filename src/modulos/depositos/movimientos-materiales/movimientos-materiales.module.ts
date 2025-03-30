import { Module } from '@nestjs/common';
import { MovimientosMaterialesController } from './controller/movimientos-materiales.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallesMovimientosMaterialesService } from './service/detalles-movimientos-materiales.service';
import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MovimientoMaterial } from '@database/entity/depositos/movimiento-material.entity';
import { DetalleMovimientoMaterialView } from '@database/view/depositos/detalle-movimiento-material.view';
import { MovimientoMaterialView } from '@database/view/depositos/movimiento-material.view';
import { Material } from '@database/entity/depositos/material.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { RegistrarMovimientoMaterial } from './service/registrar-movimiento-material.service';
import { EliminarMovimientoMaterialService } from './service/eliminar-movimiento-material.service';
import { EditarMovimientoMaterialService } from './service/editar-movimiento-material.service';
import { ConsultarMovimientoMaterialesService } from './service/consultar-movimiento-materiales.service';

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
    DetallesMovimientosMaterialesService,
    JwtUtilsService,
    RegistrarMovimientoMaterial,
    EliminarMovimientoMaterialService,
    EditarMovimientoMaterialService,
    ConsultarMovimientoMaterialesService
  ],
  controllers: [MovimientosMaterialesController]
})
export class MovimientosMaterialesModule {}
