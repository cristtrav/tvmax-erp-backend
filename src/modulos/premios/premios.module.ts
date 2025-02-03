import { Module } from '@nestjs/common';
import { PremiosService } from './premios.service';
import { PremiosController } from './premios.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Premio } from '@database/entity/sorteos/premio.entity';
import { PremioView } from '@database/view/sorteos/premio.view';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Premio, PremioView, Permiso])
  ],
  providers: [PremiosService, JwtUtilsService],
  controllers: [PremiosController]
})
export class PremiosModule {}
