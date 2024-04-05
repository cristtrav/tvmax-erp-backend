import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { JwtModule } from '@nestjs/jwt';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioView } from '@database/view/usuario.view';
import { Usuario } from '@database/entity/usuario.entity';
import { Permiso } from '@database/entity/permiso.entity';
import { RolUsuario } from '@database/entity/rol-usuario.entity';
import { Rol } from '@database/entity/rol.entity';
import { RolView } from '@database/view/rol.view';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Usuario, UsuarioView, Permiso, RolUsuario, Rol, RolView])
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController]
})
export class UsuariosModule {}
