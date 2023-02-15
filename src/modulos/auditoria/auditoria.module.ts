import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from '@database/entity/permiso.entity';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { EventoAuditoriaView } from '@database/view/evento-auditoria.view';
import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';

@Module({
  imports:[
    JwtModule.register({}),
    TypeOrmModule.forFeature([Permiso, EventoAuditoria, EventoAuditoriaView, TablaAuditoria])
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService]
})
export class AuditoriaModule {}
