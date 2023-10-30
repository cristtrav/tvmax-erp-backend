import { Module } from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { MaterialesController } from './materiales.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilModule } from '@util/util.module';
import { Material } from '@database/entity/material.entity';
import { MaterialView } from '@database/view/material.view';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([
      Material, MaterialView
    ])
  ],
  providers: [MaterialesService],
  controllers: [MaterialesController]
})
export class MaterialesModule {}
