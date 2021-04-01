import { Module } from '@nestjs/common';
import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';
import { DatabaseService } from './../../global/database/database.service';

@Module({
  controllers: [GruposController],
  providers: [GruposService, DatabaseService]
})
export class GruposModule {}
