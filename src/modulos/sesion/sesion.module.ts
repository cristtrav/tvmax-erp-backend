import { Module } from '@nestjs/common';
import { from } from 'rxjs';
import { SesionController } from './sesion.controller';
import { SesionService } from './sesion.service';
import { DatabaseService } from './../../global/database/database.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({})
  ],
  controllers: [SesionController],
  providers: [SesionService, DatabaseService]
})
export class SesionModule { }
