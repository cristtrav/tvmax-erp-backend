import { Module } from '@nestjs/common';
import { TiposdomiciliosService } from './tiposdomicilios.service';
import { TiposdomiciliosController } from './tiposdomicilios.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';

@Module({
  imports: [
    JwtModule.register({})
  ],
  providers: [TiposdomiciliosService, DatabaseService],
  controllers: [TiposdomiciliosController]
})
export class TiposdomiciliosModule {}
