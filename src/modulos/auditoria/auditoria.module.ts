import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '@database/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports:[
    JwtModule.register({}),
    TypeOrmModule.forFeature([Permiso])
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, DatabaseService]
})
export class AuditoriaModule {}
