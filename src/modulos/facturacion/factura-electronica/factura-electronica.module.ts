import { Module } from '@nestjs/common';
import { FacturaElectronicaService } from './services/factura-electronica.service';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaElectronicaView } from '@database/view/facturacion/factura-electronica.view';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      FacturaElectronica,
      FacturaElectronicaView,
    ])
  ],
  providers: [
    FacturaElectronicaService,
  ],
  exports: [FacturaElectronicaService]
})
export class FacturaElectronicaModule {}
