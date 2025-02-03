import { Module } from '@nestjs/common';
import { DomiciliosService } from './domicilios.service';
import { DomiciliosController } from './domicilios.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domicilio } from '@database/entity/domicilio.entity';
import { DomicilioView } from '@database/view/domicilio.view';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Domicilio, DomicilioView, Permiso])
  ],
  providers: [DomiciliosService, JwtUtilsService],
  controllers: [DomiciliosController]
})
export class DomiciliosModule {}
