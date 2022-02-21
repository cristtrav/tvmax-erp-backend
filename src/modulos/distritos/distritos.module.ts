import { Module } from '@nestjs/common';
import { DistritosService } from './distritos.service';
import { DistritosController } from './distritos.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';
import { UtilModule } from '@util/util.module';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule
  ],
  providers: [DistritosService, DatabaseService],
  controllers: [DistritosController]
})
export class DistritosModule {}
