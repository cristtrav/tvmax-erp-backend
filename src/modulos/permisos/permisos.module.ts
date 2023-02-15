import { Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from '@database/entity/permiso.entity';
import { Modulo } from '@database/entity/modulo.entity';
import { Funcionalidad } from '@database/entity/funcionalidad.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Permiso, Modulo, Funcionalidad, Usuario])
  ],
  providers: [
    PermisosService,
    JwtUtilsService
  ],
  controllers: [PermisosController]
})
export class PermisosModule {}
