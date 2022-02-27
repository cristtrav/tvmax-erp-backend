import { Module } from '@nestjs/common';
import { CuotasService } from './cuotas.service';
import { DatabaseService } from '@database/database.service';
import { CuotasController } from './cuotas.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UtilModule } from '@util/util.module';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule
  ],
  providers: [CuotasService, DatabaseService],
  controllers: [CuotasController]
})
export class CuotasModule { }
