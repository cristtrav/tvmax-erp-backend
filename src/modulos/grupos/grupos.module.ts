import { Module } from '@nestjs/common';
import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';
import { DatabaseService } from './../../global/database/database.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from '@database/entity/grupo.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Grupo])
  ],
  controllers: [GruposController],
  providers: [
    GruposService,
    DatabaseService,
    JwtUtilsService
  ]
})
export class GruposModule {}
