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
import { RolView } from '@database/view/rol.view';
import { Rol } from '@database/entity/rol.entity';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Usuario, UsuarioView, Permiso, RolUsuario, RolView, Rol])
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService]
})
export class UsuariosModule {}
