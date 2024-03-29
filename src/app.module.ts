import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GruposModule } from './modulos/grupos/grupos.module';
import { ConfigModule } from '@nestjs/config';
import { SesionModule } from './modulos/sesion/sesion.module';
import { ServiciosModule } from './modulos/servicios/servicios.module';
import { DepartamentosModule } from './modulos/departamentos/departamentos.module';
import { DistritosModule } from './modulos/distritos/distritos.module';
import { BarriosModule } from './modulos/barrios/barrios.module';
import { ClientesModule } from './modulos/clientes/clientes.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { SuscripcionesModule } from './modulos/suscripciones/suscripciones.module';
import { DomiciliosModule } from './modulos/domicilios/domicilios.module';
import { CuotasModule } from './modulos/cuotas/cuotas.module';
import { TimbradosModule } from './modulos/timbrados/timbrados.module';
import { VentasModule } from './modulos/ventas/ventas.module';
import { PermisosModule } from './modulos/permisos/permisos.module';
import { AuditoriaModule } from './modulos/auditoria/auditoria.module';
import { UtilModule } from './util/util.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './modulos/roles/roles.module';
import { ResumenesSuscripcionesModule } from './modulos/estadisticas/resumenes-suscripciones/resumenes-suscripciones.module';
import { CobrosModule } from './modulos/cobros/cobros.module';
import { ResumenesVentasModule } from './modulos/estadisticas/resumenes-ventas/resumenes-ventas.module';
import { FormatoFacturasModule } from './modulos/formato-facturas/formato-facturas.module';
import { CobranzaExternaModule } from './modulos/cobranza-externa/cobranza-externa.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './global/tasks/tasks.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SorteosModule } from './modulos/sorteos/sorteos.module';
import { PremiosModule } from './modulos/premios/premios.module';
import { TiposMaterialesModule } from './modulos/tipos-materiales/tipos-materiales.module';
import { MaterialesModule } from './modulos/materiales/materiales.module';
import { MovimientosMaterialesModule } from './modulos/movimientos-materiales/movimientos-materiales.module';
import { AppInitService } from './app-init.service';
import { UsuariosDepositosModule } from './modulos/usuarios-depositos/usuarios-depositos.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client')
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '..', '.env'),
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
    SuscripcionesModule,
    DomiciliosModule,
    CuotasModule,
    TimbradosModule,
    VentasModule,
    PermisosModule,
    AuditoriaModule,
    UtilModule,
    RolesModule,
    ResumenesSuscripcionesModule,
    CobrosModule,
    ResumenesVentasModule,
    FormatoFacturasModule,
    CobranzaExternaModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT),
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      synchronize: false,
      autoLoadEntities: true,
      extra: {
        poolSize: 20,
        connectionTimeoutMillis: 30000,
        query_timeout: 20000,
        statement_timeout: 20000
      }
    }),
    TasksModule,
    SorteosModule,
    PremiosModule,
    TiposMaterialesModule,
    MaterialesModule,
    MovimientosMaterialesModule,
    UsuariosDepositosModule
  ],
  controllers: [AppController],
  providers: [AppService, AppInitService],
})
export class AppModule {}
