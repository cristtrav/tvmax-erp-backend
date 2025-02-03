import { Module } from '@nestjs/common';
import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from '@database/entity/grupo.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Grupo, Permiso])
  ],
  controllers: [GruposController],
  providers: [
    GruposService,
    JwtUtilsService
  ]
})
export class GruposModule {}
