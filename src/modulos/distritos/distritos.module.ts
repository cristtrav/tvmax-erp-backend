import { Module } from '@nestjs/common';
import { DistritosService } from './distritos.service';
import { DistritosController } from './distritos.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';

@Module({
  imports: [
    JwtModule.register({})
  ],
  providers: [DistritosService, DatabaseService],
  controllers: [DistritosController]
})
export class DistritosModule {}
