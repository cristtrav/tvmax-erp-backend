import { Module } from '@nestjs/common';
import { CuotasGruposController } from './controller/cuotas-grupos.controller';
import { CuotasGruposService } from './service/cuotas-grupos.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotaGrupo } from '@database/entity/cuota-grupo.entity';
import { CuotaGrupoView } from '@database/view/cuota-grupo.view';
import { Permiso } from '@database/entity/permiso.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      CuotaGrupo,
      CuotaGrupoView,
      Permiso
    ])
  ],
  controllers: [CuotasGruposController],
  providers: [CuotasGruposService]
})
export class CuotasGruposModule {}
