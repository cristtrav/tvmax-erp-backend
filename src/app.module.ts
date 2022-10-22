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
import { ClientesModule } from './modulos/clientes/clientes.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { CobradoresModule } from './modulos/cobradores/cobradores.module';
import { SuscripcionesModule } from './modulos/suscripciones/suscripciones.module';
import { DomiciliosModule } from './modulos/domicilios/domicilios.module';
import { CuotasModule } from './modulos/cuotas/cuotas.module';
import { TimbradosModule } from './modulos/timbrados/timbrados.module';
import { VentasModule } from './modulos/ventas/ventas.module';
import { PermisosModule } from './modulos/permisos/permisos.module';
import { AuditoriaModule } from './modulos/auditoria/auditoria.module';
import { UtilModule } from './util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamento } from '@database/entity/departamento.entity';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    GruposModule,
    SesionModule,
    ServiciosModule,
    DepartamentosModule,
    DistritosModule,
    BarriosModule,
    ClientesModule,
    UsuariosModule,
    CobradoresModule,
    SuscripcionesModule,
    DomiciliosModule,
    CuotasModule,
    TimbradosModule,
    VentasModule,
    PermisosModule,
    AuditoriaModule,
    UtilModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT),
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      synchronize: false,
      entities: [Departamento, EventoAuditoria]
    })
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
