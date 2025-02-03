import { Module } from '@nestjs/common';
import { TiposMaterialesController } from './tipos-materiales.controller';
import { TiposMaterialesService } from './tipos-materiales.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoMaterial } from '@database/entity/depositos/tipo-material.entity';
import { TipoMaterialView } from '@database/view/depositos/tipos-materiales.view';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      TipoMaterial, TipoMaterialView, Permiso
    ])
  ],
  controllers: [TiposMaterialesController],
  providers: [TiposMaterialesService, JwtUtilsService]
})
export class TiposMaterialesModule {}
