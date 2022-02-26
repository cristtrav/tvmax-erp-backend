import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { DatabaseService } from '@database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { ClientesService } from '../clientes/clientes.service';
import { UtilModule } from '@util/util.module';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule
  ],
  providers: [VentasService, DatabaseService, ClientesService],
  controllers: [VentasController]
})
export class VentasModule {}
