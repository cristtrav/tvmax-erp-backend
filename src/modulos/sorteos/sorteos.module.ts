import { Module } from '@nestjs/common';
import { SorteosController } from './sorteos.controller';
import { SorteosService } from './sorteos.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sorteo } from '@database/entity/sorteos/sorteo.entity';
import { Premio } from '@database/entity/sorteos/premio.entity';
import { PremiosService } from '@modulos/premios/premios.service';
import { PremioView } from '@database/view/sorteos/premio.view';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { Cliente } from '@database/entity/cliente.entity';
import { ParticipanteView } from '@database/view/sorteos/participante.view';
import { Participante } from '@database/entity/sorteos/participante.entity';
import { SorteoView } from '@database/view/sorteos/sorteo.view';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Sorteo,
      Premio,
      PremioView,
      Suscripcion,
      ParticipanteView,
      Participante,
      SorteoView,
      Cliente,
      Permiso
    ])
  ],
  controllers: [SorteosController],
  providers: [SorteosService, PremiosService, JwtUtilsService]
})
export class SorteosModule {}
