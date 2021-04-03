import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GruposModule } from './modulos/grupos/grupos.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './global/database/database.service';
import { SesionModule } from './modulos/sesion/sesion.module';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    GruposModule,
    SesionModule
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
