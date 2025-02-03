import { Module } from '@nestjs/common';
import { ReiteracionService } from './reiteracion.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reiteracion } from '@database/entity/reclamos/reiteracion.entity';
import { ReiteracionView } from '@database/view/reclamos/reiteracion.view';
import { ReiteracionController } from './reiteracion.controller';
import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { ReclamoView } from '@database/view/reclamos/reclamo.view';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reclamo,
      Reiteracion,
      ReiteracionView,
      Permiso,
      ReclamoView
    ]),
    JwtModule.register({})
  ],
  providers: [ReiteracionService, JwtUtilsService],
  controllers: [ReiteracionController]
})
export class ReiteracionModule {}
