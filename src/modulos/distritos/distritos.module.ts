import { Module } from '@nestjs/common';
import { DistritosService } from './distritos.service';
import { DistritosController } from './distritos.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distrito } from '@database/entity/distrito.entity';
import { DistritoView } from '@database/view/distritos.view';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Distrito, DistritoView])
  ],
  providers: [DistritosService, DatabaseService],
  controllers: [DistritosController]
})
export class DistritosModule {}
