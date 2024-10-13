import { Module } from '@nestjs/common';
import { CodigoSeguridadContribuyenteService } from './codigo-seguridad-contribuyente.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CodigoSeguridadContribuyente
    ])
  ],
  providers: [CodigoSeguridadContribuyenteService],
  exports: [CodigoSeguridadContribuyenteService]
})
export class CodigoSeguridadContribuyenteModule {}
