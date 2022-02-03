import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { DatabaseService } from '@database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { ClientesService } from '../clientes/clientes.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [VentasService, DatabaseService, ClientesService],
  controllers: [VentasController]
})
export class VentasModule {}
