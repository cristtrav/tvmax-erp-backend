import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtUtilsService } from './jwt-utils/jwt-utils.service';

@Module({
  imports: [
    JwtModule.register({})
  ],
  providers: [JwtUtilsService],
  exports: [JwtUtilsService]
})
export class UtilModule {}
