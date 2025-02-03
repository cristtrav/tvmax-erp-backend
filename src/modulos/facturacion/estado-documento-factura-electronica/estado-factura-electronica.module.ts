import { Module } from '@nestjs/common';
import { EstadoFacturaElectronicaController } from './controllers/estado-factura-electronica.controller';
import { EstadoFacturaElectronicaService } from './services/estado-factura-electronica.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      EstadoDocumentoSifen,
      Permiso
    ])
  ],  
  controllers: [EstadoFacturaElectronicaController],
  providers: [
    EstadoFacturaElectronicaService,
    JwtUtilsService
  ]
})
export class EstadoFacturaElectronicaModule {}
