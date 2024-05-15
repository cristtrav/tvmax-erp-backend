import { Module } from '@nestjs/common';
import { EventosCambiosEstadosService } from './eventos-cambios-estados.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoCambioEstado } from '@database/entity/reclamos/evento-cambio-estado.entity';
import { EventosCambiosEstadosView } from '@database/view/reclamos/eventos-cambios-estados.view';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      EventoCambioEstado,
      EventosCambiosEstadosView
    ])
  ],
  providers: [EventosCambiosEstadosService]
})
export class EventosCambiosEstadosModule {}
