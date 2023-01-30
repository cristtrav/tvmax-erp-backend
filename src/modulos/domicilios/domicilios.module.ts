import { Module } from '@nestjs/common';
import { DomiciliosService } from './domicilios.service';
import { DomiciliosController } from './domicilios.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '@database/database.service';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domicilio } from '@database/entity/domicilio.entity';
import { DomicilioView } from '@database/view/domicilio.view';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Domicilio, DomicilioView])
  ],
  providers: [DomiciliosService, DatabaseService],
  controllers: [DomiciliosController]
})
export class DomiciliosModule {}
