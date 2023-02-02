import { Module } from '@nestjs/common';
import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';
import { DatabaseService } from './../../global/database/database.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from '@database/entity/grupo.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Grupo, Permiso])
  ],
  controllers: [GruposController],
  providers: [
    GruposService,
    DatabaseService,
    JwtUtilsService
  ]
})
export class GruposModule {}
