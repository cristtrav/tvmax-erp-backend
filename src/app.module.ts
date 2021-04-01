import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GruposModule } from './modulos/grupos/grupos.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './global/database/database.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    GruposModule
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
