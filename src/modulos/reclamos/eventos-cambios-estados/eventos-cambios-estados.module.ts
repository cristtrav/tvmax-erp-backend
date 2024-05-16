import { Module } from '@nestjs/common';
import { EventosCambiosEstadosService } from './eventos-cambios-estados.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoCambioEstado } from '@database/entity/reclamos/evento-cambio-estado.entity';
import { EventoCambioEstadoView } from '@database/view/reclamos/evento-cambio-estado.view';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      EventoCambioEstado,
      EventoCambioEstadoView
    ])
  ],
  providers: [EventosCambiosEstadosService]
})
export class EventosCambiosEstadosModule {}
