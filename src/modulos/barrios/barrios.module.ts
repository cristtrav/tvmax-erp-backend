import { Module } from '@nestjs/common';
import { BarriosService } from './barrios.service';
import { BarriosController } from './barrios.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barrio } from '@database/entity/barrio.entity';
import { BarrioView } from '@database/view/barrio.view';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Barrio, BarrioView, Permiso])
  ],
  providers: [BarriosService, JwtUtilsService],
  controllers: [BarriosController]
})
export class BarriosModule {}
