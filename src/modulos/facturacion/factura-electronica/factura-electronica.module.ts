import { Module } from '@nestjs/common';
import { FacturaElectronicaService } from './services/factura-electronica.service';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaElectronicaView } from '@database/view/facturacion/factura-electronica.view';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      DTE,
      FacturaElectronicaView,
    ])
  ],
  providers: [
    FacturaElectronicaService,
  ],
  exports: [FacturaElectronicaService]
})
export class FacturaElectronicaModule {}
