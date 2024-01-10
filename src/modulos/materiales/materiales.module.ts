import { Module } from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { MaterialesController } from './materiales.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@util/util.module';
import { Material } from '@database/entity/depositos/material.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialView } from '@database/view/depositos/material.view';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([
      Material, MaterialView, Existencia
    ])
  ],
  providers: [MaterialesService],
  controllers: [MaterialesController]
})
export class MaterialesModule {}
