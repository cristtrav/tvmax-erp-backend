import { Module } from '@nestjs/common';
import { DepartamentosController } from './departamentos.controller';
import { DepartamentosService } from './departamentos.service';
import { DatabaseService } from '../../global/database/database.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({})
  ],
  controllers: [DepartamentosController],
  providers: [DepartamentosService, DatabaseService]
})
export class DepartamentosModule {}
