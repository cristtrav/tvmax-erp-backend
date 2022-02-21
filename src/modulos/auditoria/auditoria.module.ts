import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '@database/database.service';

@Module({
  imports:[
    JwtModule.register({})
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, DatabaseService]
})
export class AuditoriaModule {}
