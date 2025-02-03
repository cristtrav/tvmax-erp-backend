import { Module } from '@nestjs/common';
import { FacturaElectronicaService } from './services/factura-electronica.service';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DteView } from '@database/view/facturacion/dte.view';
import { JwtModule } from '@nestjs/jwt';
import { Venta } from '@database/entity/venta.entity';

@Module({
  imports:[
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      DTE,
      DteView,
      Venta
    ])
  ],
  providers: [
    FacturaElectronicaService,
  ],
  exports: [FacturaElectronicaService]
})
export class FacturaElectronicaModule {}
