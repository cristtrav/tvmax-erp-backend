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
import { ConsultaRucService } from './consulta-ruc/services/consulta-ruc.service';
import { ConsultaRucController } from './consulta-ruc/controller/consulta-ruc.controller';
import { ConsultaRucMessageService } from './consulta-ruc/services/consulta-ruc-message.service';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { LoteView } from '@database/view/facturacion/lote.view';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      FacturaElectronica,
      Lote,
      LoteView,
      EstadoDocumentoSifen,
      Permiso
    ])
  ],
  providers: [
    LoteSifenService,
    SifenApiUtilService,
    SifenUtilService,
    SifenLoteMessageService,
    ConsultaRucService,
    ConsultaRucMessageService,
    JwtUtilsService
  ],
  controllers: [LoteSifenController, ConsultaRucController],
})
export class SifenModule {}
