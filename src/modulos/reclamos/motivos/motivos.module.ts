import { Module } from '@nestjs/common';
import { MotivosService } from './motivos.service';
import { MotivosController } from './motivos.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Motivo } from '@database/entity/reclamos/motivo.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Motivo
    ])
  ],
  providers: [MotivosService, JwtUtilsService],
  controllers: [MotivosController]
})
export class MotivosModule {}
