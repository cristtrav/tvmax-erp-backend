import { Module } from '@nestjs/common';
import { BarriosService } from './barrios.service';
import { BarriosController } from './barrios.controller';
import { JwtModule } from '@nestjs/jwt';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barrio } from '@database/entity/barrio.entity';
import { BarrioView } from '@database/view/barrio.view';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Barrio, BarrioView, Permiso])
  ],
  providers: [BarriosService],
  controllers: [BarriosController]
})
export class BarriosModule {}
