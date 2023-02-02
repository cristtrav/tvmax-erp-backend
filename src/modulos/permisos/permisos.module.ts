import { Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '@database/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Permiso])
  ],
  providers: [
    PermisosService,
    DatabaseService
  ],
  controllers: [PermisosController]
})
export class PermisosModule {}
