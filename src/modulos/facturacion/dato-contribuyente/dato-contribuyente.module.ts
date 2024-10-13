import { Module } from '@nestjs/common';
import { DatoContribuyenteService } from './dato-contribuyente.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      DatoContribuyente
    ])
  ],
  providers: [DatoContribuyenteService],
  exports: [DatoContribuyenteService]
})
export class DatoContribuyenteModule {}
