import { Module } from '@nestjs/common';
import { DistritosService } from './distritos.service';
import { DistritosController } from './distritos.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distrito } from '@database/entity/distrito.entity';
import { DistritoView } from '@database/view/distritos.view';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Distrito, DistritoView, Permiso])
  ],
  providers: [DistritosService, JwtUtilsService],
  controllers: [DistritosController]
})
export class DistritosModule {}
