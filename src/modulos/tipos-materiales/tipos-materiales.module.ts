import { Module } from '@nestjs/common';
import { TiposMaterialesController } from './tipos-materiales.controller';
import { TiposMaterialesService } from './tipos-materiales.service';
import { JwtModule } from '@nestjs/jwt';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoMaterial } from '@database/entity/tipo-material.entity';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([
      TipoMaterial
    ])
  ],
  controllers: [TiposMaterialesController],
  providers: [TiposMaterialesService]
})
export class TiposMaterialesModule {}
