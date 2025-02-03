import { Module } from '@nestjs/common';
import { FindAllNotasCreditoService } from './services/find-all-notas-credito.service';
import { CountNotasCreditoService } from './services/count-notas-credito.service';
import { CountNotasCreditoController } from './controllers/count-notas-credito.controller';
import { FindAllNotasCreditoController } from './controllers/find-all-notas-credito.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { NotaCreditoDetalle } from '@database/entity/facturacion/nota-credito-detalle.entity';
import { NotaCreditoView } from '@database/view/facturacion/nota-credito.view';
import { NotaCreditoDetalleView } from '@database/view/facturacion/nota-credito-detalle.view';
import { FindDetallesByNotaCreditoService } from './services/find-detalles-by-nota-credito.service';
import { FindDetallesByNotaCreditoController } from './controllers/find-detalles-by-nota-credito.controller';
import { Permiso } from '@database/entity/permiso.entity';
import { FindDteByNotacreditoController } from './controllers/find-dte-by-notacredito.controller';
import { FindDteXmlByNotacreditoController } from './controllers/find-dte-xml-by-notacredito.controller';
import { FindKudeByNotacreditoController } from './controllers/find-kude-by-notacredito.controller';
import { FindDteByNotacreditoService } from './services/find-dte-by-notacredito.service';
import { FindDteXmlByNotacreditoService } from './services/find-dte-xml-by-notacredito.service';
import { FindKudeByNotacreditoService } from './services/find-kude-by-notacredito.service';
import { DteView } from '@database/view/facturacion/dte.view';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { SifenUtilsModule } from '@modulos/sifen/sifen-utils/sifen-utils.module';
import { DeleteNotaCreditoService } from './services/delete-nota-credito.service';
import { DeleteNotaCreditoController } from './controllers/delete-nota-credito.controller';
import { CancelarNotaCreditoService } from './services/cancelar-nota-credito.service';
import { CancelarNotaCreditoController } from './controllers/cancelar-nota-credito.controller';
import { Cuota } from '@database/entity/cuota.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { Venta } from '@database/entity/venta.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      NotaCredito,
      NotaCreditoDetalle,
      NotaCreditoView,
      NotaCreditoDetalleView,
      Permiso,
      DteView,
      DTE,
      Cuota,
      DetalleVenta,
      Venta
    ]),
    SifenUtilsModule
  ],
  providers: [
    FindAllNotasCreditoService,
    CountNotasCreditoService,
    FindDetallesByNotaCreditoService,
    FindDteByNotacreditoService,
    FindDteXmlByNotacreditoService,
    FindKudeByNotacreditoService,
    DeleteNotaCreditoService,
    CancelarNotaCreditoService
  ],
  controllers: [CountNotasCreditoController, FindAllNotasCreditoController, FindDetallesByNotaCreditoController, FindDteByNotacreditoController, FindDteXmlByNotacreditoController, FindKudeByNotacreditoController, DeleteNotaCreditoController, CancelarNotaCreditoController]
})
export class NotasCreditoModule {}
