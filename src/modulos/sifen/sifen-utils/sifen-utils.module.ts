import { Module } from '@nestjs/common';
import { SifenUtilService } from './services/sifen/sifen-util.service';
import { SifenEventosUtilService } from './services/sifen/sifen-eventos-util.service';
import { SifenApiUtilService } from './services/sifen/sifen-api-util.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaView } from '@database/view/venta.view';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { DetalleLote } from '@database/entity/facturacion/lote-detalle.entity';
import { DteUtilsService } from './services/dte/dte-utils.service';
import { FacturaElectronicaUtilsService } from './services/dte/factura-electronica-utils.service';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { ClienteView } from '@database/view/cliente.view';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { LoteDteService } from './services/lotes/lote-dte.service';
import { LoteView } from '@database/view/facturacion/lote.view';
import { LoteDetalleView } from '@database/view/facturacion/lote-detalle.view';
import { KudeUtilService } from './services/kude/kude-util.service';
import { LoteDteController } from './controllers/lotes/lote-dte.controller';
import { JwtModule } from '@nestjs/jwt';
import { Permiso } from '@database/entity/permiso.entity';
import { NotaCreditoElectronicaUtilsService } from './services/dte/nota-credito-electronica-utils.service';
import { DteXmlUtilsService } from './services/dte/dte-xml-utils.service';
import { ConsultaDTEMessageService } from './services/consultas/consulta-dte-message.service';
import { ConsultaLoteMessageService } from './services/consultas/consulta-lote-message.service';
import { ConsultaRucMessageService } from './services/consultas/consulta-ruc-message.service';
import { ConsultaRucService } from './services/consultas/consulta-ruc.service';
import { Venta } from '@database/entity/venta.entity';
import { FacturaElectronicaService } from '@modulos/facturacion/factura-electronica/services/factura-electronica.service';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { NotaCreditoDetalle } from '@database/entity/facturacion/nota-credito-detalle.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { ConsultaRucController } from './controllers/consultas/consulta-ruc.controller';

@Module({
    imports: [
        JwtModule.register({}),
        TypeOrmModule.forFeature([
            VentaView,
            TalonarioView,
            DTE,
            EstadoDocumentoSifen,
            Lote,
            DetalleLote,
            Establecimiento,
            ActividadEconomica,
            ClienteView,
            DatoContribuyente,
            CodigoSeguridadContribuyente,
            LoteView,
            LoteDetalleView,
            Permiso,
            Venta,
            NotaCredito,
            DetalleVenta,
            NotaCredito,
            NotaCreditoDetalle,
            Cuota
        ])
    ],
    controllers: [
        LoteDteController,
        ConsultaRucController
    ],
    providers: [
        DteXmlUtilsService,
        SifenUtilService,
        SifenEventosUtilService,
        SifenApiUtilService,
        DteUtilsService,
        FacturaElectronicaUtilsService,
        LoteDteService,
        KudeUtilService,
        NotaCreditoElectronicaUtilsService,
        ConsultaDTEMessageService,
        ConsultaLoteMessageService,
        ConsultaRucMessageService,
        ConsultaRucService
    ],
    exports: [
        DteXmlUtilsService,
        SifenApiUtilService,
        SifenEventosUtilService,
        SifenUtilService,
        DteUtilsService,
        FacturaElectronicaUtilsService,
        NotaCreditoElectronicaUtilsService,        
        LoteDteService,
        KudeUtilService
    ]
})
export class SifenUtilsModule {}
