import { Module } from '@nestjs/common';
import { CobradoresService } from './cobradores.service';
import { CobradoresController } from './cobradores.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../global/database/database.service';
import { UtilModule } from '@util/util.module';

@Module({
  imports: [
    JwtModule.register({}),
    UtilModule
  ],
  providers: [CobradoresService, DatabaseService],
  controllers: [CobradoresController]
})
export class CobradoresModule {}
