import { Module } from '@nestjs/common';
import { ReclamosService } from './reclamos.service';
import { ReclamosController } from './reclamos.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({})
  ],
  providers: [ReclamosService, JwtUtilsService],
  controllers: [ReclamosController]
})
export class ReclamosModule {}
