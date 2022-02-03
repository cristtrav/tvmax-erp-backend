import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [ClientesService, DatabaseService, SuscripcionesService],
  controllers: [ClientesController]
})
export class ClientesModule {}
