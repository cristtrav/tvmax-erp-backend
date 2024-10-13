import { Module } from '@nestjs/common';
import { FacturaElectronicaService } from './factura-electronica.service';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      FacturaElectronica
    ])
  ],
  providers: [FacturaElectronicaService],
  exports: [FacturaElectronicaService]
})
export class FacturaElectronicaModule {}
