import { Module } from '@nestjs/common';
import { DistritosService } from './distritos.service';
import { DistritosController } from './distritos.controller';
import { JwtModule } from '@nestjs/jwt';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distrito } from '@database/entity/distrito.entity';
import { DistritoView } from '@database/view/distritos.view';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Distrito, DistritoView, Permiso])
  ],
  providers: [DistritosService],
  controllers: [DistritosController]
})
export class DistritosModule {}
