import { Module } from '@nestjs/common';
import { UsuariosDepositosService } from './usuarios-depositos.service';
import { UsuariosDepositosController } from './usuarios-depositos.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioDeposito } from '@database/entity/depositos/usuario-deposito.entity';
import { UsuarioDepositoView } from '@database/view/depositos/usuario-deposito.view';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports:[
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      UsuarioDeposito, UsuarioDepositoView, Permiso
    ])
  ],
  providers: [UsuariosDepositosService, JwtUtilsService],
  controllers: [UsuariosDepositosController]
})
export class UsuariosDepositosModule {}
