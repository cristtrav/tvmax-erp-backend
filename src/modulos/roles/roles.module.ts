import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '@database/entity/rol.entity';
import { DatabaseService } from '@database/database.service';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { RolView } from '@database/view/rol.view';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Rol, RolView, Permiso])
  ],
  providers: [RolesService, DatabaseService, JwtUtilsService],
  controllers: [RolesController]
})
export class RolesModule {}