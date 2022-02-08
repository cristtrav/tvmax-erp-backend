import { Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '@database/database.service';

@Module({
  imports: [
    JwtModule.register({})
  ],
  providers: [
    PermisosService,
    DatabaseService
  ],
  controllers: [PermisosController]
})
export class PermisosModule {}
