import { Module } from '@nestjs/common';
import { SorteosController } from './sorteos.controller';
import { SorteosService } from './sorteos.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sorteo } from '@database/entity/sorteos/sorteo.entity';
import { Premio } from '@database/entity/sorteos/premio.entity';
import { UtilModule } from '@util/util.module';
import { PremiosService } from '@modulos/premios/premios.service';
import { PremioView } from '@database/view/sorteos/premio.view';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Cliente } from '@database/entity/cliente.entity';
import { ParticipanteView } from '@database/view/sorteos/participante.view';
import { Participante } from '@database/entity/sorteos/participante.entity';

@Module({
  imports: [
    UtilModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Sorteo, Premio, PremioView, Suscripcion, Cliente, ParticipanteView, Participante
    ])
  ],
  controllers: [SorteosController],
  providers: [SorteosService, PremiosService]
})
export class SorteosModule {}
