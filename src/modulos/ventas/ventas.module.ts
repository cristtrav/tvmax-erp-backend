import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { DatabaseService } from '@database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { ClientesService } from '../clientes/clientes.service';
import { UtilModule } from '@util/util.module';
import { ResumenVentasService } from './resumen-ventas/resumen-ventas.service';
import { ResumenVentasController } from './resumen-ventas/resumen-ventas.controller';
import { DetallesVentasService } from './detalles-ventas/detalles-ventas.service';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule
  ],
  providers: [VentasService, DatabaseService, ClientesService, ResumenVentasService, DetallesVentasService],
  controllers: [VentasController, ResumenVentasController]
})
export class VentasModule {}
