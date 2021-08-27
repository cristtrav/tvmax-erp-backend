import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GruposModule } from './modulos/grupos/grupos.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './global/database/database.service';
import { SesionModule } from './modulos/sesion/sesion.module';
import { ServiciosModule } from './modulos/servicios/servicios.module';
import { DepartamentosModule } from './modulos/departamentos/departamentos.module';
import { DistritosModule } from './modulos/distritos/distritos.module';
import { BarriosModule } from './modulos/barrios/barrios.module';
import { TiposdomiciliosModule } from './modulos/tiposdomicilios/tiposdomicilios.module';
import { ClientesModule } from './modulos/clientes/clientes.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    GruposModule,
    SesionModule,
    ServiciosModule,
    DepartamentosModule,
    DistritosModule,
    BarriosModule,
    TiposdomiciliosModule,
    ClientesModule,
    UsuariosModule
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
