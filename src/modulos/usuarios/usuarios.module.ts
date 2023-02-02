import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioView } from '@database/view/usuario.view';
import { Usuario } from '@database/entity/usuario.entity';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Usuario, UsuarioView, Permiso])
  ],
  providers: [UsuariosService, DatabaseService],
  controllers: [UsuariosController]
})
export class UsuariosModule {}
