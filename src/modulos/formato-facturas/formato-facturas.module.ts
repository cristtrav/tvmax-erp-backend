import { FormatoFactura } from '@database/entity/formato-factura.entity';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormatoFacturasController } from './formato-facturas.controller';
import { FormatoFacturasService } from './formato-facturas.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Permiso, FormatoFactura])
  ],
  controllers: [FormatoFacturasController],
  providers: [FormatoFacturasService, JwtUtilsService]
})
export class FormatoFacturasModule {}
