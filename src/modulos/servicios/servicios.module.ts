import { Servicio } from '@database/entity/servicio.entity';
import { CuotaView } from '@database/view/cuota.view';
import { ServicioView } from '@database/view/servicio.view';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from '../../global/database/database.service';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Servicio, ServicioView, CuotaView])
  ],
  controllers: [ServiciosController],
  providers: [ServiciosService, DatabaseService, JwtUtilsService]
})
export class ServiciosModule {}
