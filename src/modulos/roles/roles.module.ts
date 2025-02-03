import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '@database/entity/rol.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { RolView } from '@database/view/rol.view';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Rol, RolView, Permiso])
  ],
  providers: [RolesService, JwtUtilsService],
  controllers: [RolesController]
})
export class RolesModule {}
