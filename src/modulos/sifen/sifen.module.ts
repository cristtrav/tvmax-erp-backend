import { Module } from '@nestjs/common';
import { LoteSifenService } from './lote-sifen/services/lote-sifen.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { LoteSifenController } from './lote-sifen/controllers/lote-sifen.controller';
import { SifenApiUtilService } from '@modulos/ventas/service/sifen-api-util.service';
import { SifenUtilService } from '@modulos/ventas/service/sifen-util.service';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { SifenLoteMessageService } from './lote-sifen/services/sifen-lote-message.service';
import { Venta } from '@database/entity/venta.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      FacturaElectronica,
      Lote,
      EstadoDocumentoSifen
    ])
  ],
  providers: [
    LoteSifenService,
    SifenApiUtilService,
    SifenUtilService,
    SifenLoteMessageService
  ],
  controllers: [LoteSifenController],
})
export class SifenModule {}
