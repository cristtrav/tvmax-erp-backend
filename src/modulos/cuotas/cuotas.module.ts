import { Module } from '@nestjs/common';
import { CuotasService } from './cuotas.service';
import { DatabaseService } from '@database/database.service';
import { CuotasController } from './cuotas.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UtilModule } from '@util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuota } from '@database/entity/cuota.entity';
import { CuotaView } from '@database/view/cuota.view';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule,
    TypeOrmModule.forFeature([Cuota, CuotaView])
  ],
  providers: [CuotasService, DatabaseService],
  controllers: [CuotasController]
})
export class CuotasModule { }
