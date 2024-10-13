import { Module } from '@nestjs/common';
import { ExportarCsvController } from './exportar-csv.controller';
import { ExportarCsvService } from './exportar-csv.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaView } from '@database/view/venta.view';
import { Venta } from '@database/entity/venta.entity';
import { VentaTributacionExpView } from '@database/view/venta-tributacion-exp.view';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Venta,
      VentaView,
      VentaTributacionExpView,
      Permiso
    ])
  ],
  controllers: [ExportarCsvController],
  providers: [ExportarCsvService, JwtUtilsService]
})
export class TributacionModule {}
