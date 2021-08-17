import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';

@Module({
  imports: [
    JwtModule.register({})
  ],
  controllers: [ServiciosController],
  providers: [ServiciosService, DatabaseService]
})
export class ServiciosModule {}
