import { Module } from '@nestjs/common';
import { DepartamentosController } from './departamentos.controller';
import { DepartamentosService } from './departamentos.service';
import { DatabaseService } from '../../global/database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamento } from '@database/entity/departamento.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Departamento])
  ],
  controllers: [DepartamentosController],
  providers: [DepartamentosService, DatabaseService, JwtUtilsService]
})
export class DepartamentosModule {}
