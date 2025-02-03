import { Module } from '@nestjs/common';
import { DatoContribuyenteService } from './dato-contribuyente.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatoContribuyenteController } from './dato-contribuyente.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports:[
    JwtModule.register({}),    
    TypeOrmModule.forFeature([
      DatoContribuyente,
      Permiso
    ])
  ],
  providers: [DatoContribuyenteService, JwtUtilsService],
  exports: [DatoContribuyenteService],
  controllers: [DatoContribuyenteController]
})
export class DatoContribuyenteModule {}
