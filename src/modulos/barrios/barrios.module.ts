import { Module } from '@nestjs/common';
import { BarriosService } from './barrios.service';
import { BarriosController } from './barrios.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';

@Module({
  imports: [
    JwtModule.register({})
  ],
  providers: [BarriosService, DatabaseService],
  controllers: [BarriosController]
})
export class BarriosModule {}
