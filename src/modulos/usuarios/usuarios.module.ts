import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';
import { UtilModule } from '@util/util.module';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule
  ],
  providers: [UsuariosService, DatabaseService],
  controllers: [UsuariosController]
})
export class UsuariosModule {}
