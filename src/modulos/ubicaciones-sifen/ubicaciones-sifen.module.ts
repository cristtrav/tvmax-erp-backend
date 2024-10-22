import { Module } from '@nestjs/common';
import { UbicacionesSifenController } from './ubicaciones-sifen.controller';
import { UbicacionesSifenService } from './ubicaciones-sifen.service';

@Module({
  controllers: [UbicacionesSifenController],
  providers: [UbicacionesSifenService]
})
export class UbicacionesSifenModule {}
