import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [ClientesService, DatabaseService],
  controllers: [ClientesController]
})
export class ClientesModule {}
