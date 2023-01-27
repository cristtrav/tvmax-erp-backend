import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '@database/entity/cliente.entity';
import { ClienteView } from '@database/view/cliente.view';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Cliente, ClienteView])
  ],
  providers: [ClientesService, DatabaseService, SuscripcionesService],
  controllers: [ClientesController]
})
export class ClientesModule {}
