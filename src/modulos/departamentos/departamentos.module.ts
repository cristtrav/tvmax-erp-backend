import { Module } from '@nestjs/common';
import { DepartamentosController } from './departamentos.controller';
import { DepartamentosService } from './departamentos.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamento } from '@database/entity/departamento.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Departamento, Permiso])
  ],
  controllers: [DepartamentosController],
  providers: [DepartamentosService, JwtUtilsService]
})
export class DepartamentosModule {}
