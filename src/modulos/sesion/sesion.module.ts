import { Module } from '@nestjs/common';
import { SesionController } from './sesion.controller';
import { SesionService } from './sesion.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '@database/entity/usuario.entity';
import { UsuarioView } from '@database/view/usuario.view';
import { Sesion } from '@database/entity/sesion.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { PermisosService } from '@modulos/permisos/permisos.service';
import { PermisosModule } from '@modulos/permisos/permisos.module';

@Module({
  imports: [
    PermisosModule,
    TypeOrmModule.forFeature([Usuario, UsuarioView, Sesion]),
    JwtModule.register({})
  ],
  controllers: [SesionController],
  providers: [SesionService, JwtUtilsService]
})
export class SesionModule { }
