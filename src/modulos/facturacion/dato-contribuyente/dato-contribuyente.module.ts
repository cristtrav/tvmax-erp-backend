import { Module } from '@nestjs/common';
import { DatoContribuyenteService } from './dato-contribuyente.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatoContribuyenteController } from './dato-contribuyente.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports:[
    JwtModule.register({}),    
    TypeOrmModule.forFeature([
      DatoContribuyente
    ])
  ],
  providers: [DatoContribuyenteService, JwtUtilsService],
  exports: [DatoContribuyenteService],
  controllers: [DatoContribuyenteController]
})
export class DatoContribuyenteModule {}
