import { Module } from '@nestjs/common';
import { DomiciliosService } from './domicilios.service';
import { DomiciliosController } from './domicilios.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '@database/database.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [DomiciliosService, DatabaseService],
  controllers: [DomiciliosController]
})
export class DomiciliosModule {}
