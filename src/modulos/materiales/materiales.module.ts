import { Module } from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { MaterialesController } from './materiales.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from '@database/entity/depositos/material.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialView } from '@database/view/depositos/material.view';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Permiso } from '@database/entity/permiso.entity';
import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Material, MaterialView, Existencia, MaterialIdentificable, Permiso, DetalleMovimientoMaterial
    ])
  ],
  providers: [MaterialesService, JwtUtilsService],
  controllers: [MaterialesController]
})
export class MaterialesModule {}
