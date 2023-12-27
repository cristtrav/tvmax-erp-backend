import { Module } from '@nestjs/common';
import { SorteosController } from './sorteos.controller';
import { SorteosService } from './sorteos.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sorteo } from '@database/entity/sorteo.entity';
import { Premio } from '@database/entity/premio.entity';
import { UtilModule } from '@util/util.module';

@Module({
  imports: [
    UtilModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Sorteo, Premio
    ])
  ],
  controllers: [SorteosController],
  providers: [SorteosService]
})
export class SorteosModule {}
