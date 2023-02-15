import { Module } from '@nestjs/common';
import { DomiciliosService } from './domicilios.service';
import { DomiciliosController } from './domicilios.controller';
import { JwtModule } from '@nestjs/jwt';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domicilio } from '@database/entity/domicilio.entity';
import { DomicilioView } from '@database/view/domicilio.view';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Domicilio, DomicilioView, Permiso])
  ],
  providers: [DomiciliosService],
  controllers: [DomiciliosController]
})
export class DomiciliosModule {}
