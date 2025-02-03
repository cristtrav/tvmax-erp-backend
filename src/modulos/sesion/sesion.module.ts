import { Module } from '@nestjs/common';
import { SesionController } from './sesion.controller';
import { SesionService } from './sesion.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '@database/entity/usuario.entity';
import { UsuarioView } from '@database/view/usuario.view';
import { Sesion } from '@database/entity/sesion.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { PermisosModule } from '@modulos/permisos/permisos.module';
import { UsuariosService } from '@modulos/usuarios/usuarios.service';
import { Rol } from '@database/entity/rol.entity';
import { RolView } from '@database/view/rol.view';
import { RolUsuario } from '@database/entity/rol-usuario.entity';
import { UsuariosModule } from '@modulos/usuarios/usuarios.module';

@Module({
  imports: [
    PermisosModule,
    UsuariosModule,
    TypeOrmModule.forFeature([Usuario, UsuarioView, Sesion, RolView, RolUsuario, Rol]),
    JwtModule.register({})
  ],
  controllers: [SesionController],
  providers: [SesionService, JwtUtilsService, UsuariosService]
})
export class SesionModule { }
