import { Module } from '@nestjs/common';
import { CobranzaExternaService } from './cobranza-externa.service';
import { CobranzaExternaController } from './cobranza-externa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '@database/entity/usuario.entity';
import { Cliente } from '@database/entity/cliente.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { CuotaView } from '@database/view/cuota.view';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { ClienteView } from '@database/view/cliente.view';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Cliente,
      ClienteView,
      Suscripcion,
      SuscripcionView,
      CuotaView,
      Cuota
    ])
  ],
  providers: [CobranzaExternaService],
  controllers: [CobranzaExternaController]
})
export class CobranzaExternaModule {}
