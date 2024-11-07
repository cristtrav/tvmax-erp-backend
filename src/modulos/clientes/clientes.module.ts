import { Module } from '@nestjs/common';
import { ClientesService } from './service/clientes.service';
import { ClientesController } from './controller/clientes.controller';
import { JwtModule } from '@nestjs/jwt';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '@database/entity/cliente.entity';
import { ClienteView } from '@database/view/cliente.view';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Cliente, ClienteView, Suscripcion, SuscripcionView, Permiso])
  ],
  providers: [ClientesService, SuscripcionesService],
  controllers: [ClientesController]
})
export class ClientesModule {}
