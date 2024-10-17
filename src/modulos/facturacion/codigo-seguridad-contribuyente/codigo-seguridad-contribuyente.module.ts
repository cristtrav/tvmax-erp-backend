import { Module } from '@nestjs/common';
import { CodigoSeguridadContribuyenteService } from './codigo-seguridad-contribuyente.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { JwtModule } from '@nestjs/jwt';
import { CodigoSerguridadContribuyenteController } from './codigo-serguridad-contribuyente.controller';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      CodigoSeguridadContribuyente,
      Permiso
    ])
  ],
  providers: [CodigoSeguridadContribuyenteService, JwtUtilsService],
  exports: [CodigoSeguridadContribuyenteService],
  controllers: [CodigoSerguridadContribuyenteController]
})
export class CodigoSeguridadContribuyenteModule {}
