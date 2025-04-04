import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GruposModule } from './modulos/grupos/grupos.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { TalonariosModule } from './modulos/talonarios/talonarios.module';
import { VentasModule } from './modulos/ventas/ventas.module';
import { PermisosModule } from './modulos/permisos/permisos.module';
import { AuditoriaModule } from './modulos/auditoria/auditoria.module';
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
import { TiposMaterialesModule } from './modulos/depositos/tipos-materiales/tipos-materiales.module';
import { MaterialesModule } from './modulos/depositos/materiales/materiales.module';
import { MovimientosMaterialesModule } from './modulos/depositos/movimientos-materiales/movimientos-materiales.module';
import { AppInitService } from './app-init.service';
import databaseConfig from '@config/database.config';
import { MotivosModule } from './modulos/reclamos/motivos/motivos.module';
import { ReclamosModule } from './modulos/reclamos/reclamos/reclamos.module';
import { EventosCambiosEstadosModule } from './modulos/reclamos/eventos-cambios-estados/eventos-cambios-estados.module';
import { ReiteracionModule } from './modulos/reclamos/reiteracion/reiteracion.module';
import { TributacionModule } from './modulos/facturacion/exportarcsv/exportar-csv.module';
import { ActividadEconomicaModule } from './modulos/facturacion/actividad-economica/actividad-economica.module';
import { DatoContribuyenteModule } from './modulos/facturacion/dato-contribuyente/dato-contribuyente.module';
import { EstablecimientosModule } from './modulos/facturacion/establecimientos/establecimientos.module';
import { FacturaElectronicaModule } from './modulos/facturacion/factura-electronica/factura-electronica.module';
import { CodigoSeguridadContribuyenteModule } from './modulos/facturacion/codigo-seguridad-contribuyente/codigo-seguridad-contribuyente.module';
import { UbicacionesSifenModule } from './modulos/ubicaciones-sifen/ubicaciones-sifen.module';
import { EstadoFacturaElectronicaModule } from './modulos/facturacion/estado-documento-factura-electronica/estado-factura-electronica.module';
import { NotasCreditoModule } from './modulos/facturacion/notas-credito/notas-credito.module';
import { SifenUtilsModule } from './modulos/sifen/sifen-utils/sifen-utils.module';
import { UtilModule } from './global/util/util.module';
import { TimbradosModule } from './modulos/facturacion/timbrados/timbrados.module';
import { CuotasGruposModule } from './modulos/cuotas-grupos/cuotas-grupos.module';
import { ClientesTipoModule } from '@modulos/clientes-tipo/clientes-tipo.module';
import { AjustesExistenciasModule } from './modulos/depositos/ajustes-existencias/ajustes-existencias.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client')
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '..', '.env'),
      isGlobal: true,
      load: [databaseConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ ...configService.get('database') })
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
    TalonariosModule,
    VentasModule,
    PermisosModule,
    AuditoriaModule,
    RolesModule,
    ResumenesSuscripcionesModule,
    CobrosModule,
    ResumenesVentasModule,
    FormatoFacturasModule,
    CobranzaExternaModule,
    TasksModule,
    SorteosModule,
    PremiosModule,
    TiposMaterialesModule,
    MaterialesModule,
    MovimientosMaterialesModule,
    MotivosModule,
    ReclamosModule,
    EventosCambiosEstadosModule,
    ReiteracionModule,
    TributacionModule,
    ActividadEconomicaModule,
    DatoContribuyenteModule,
    EstablecimientosModule,
    FacturaElectronicaModule,
    CodigoSeguridadContribuyenteModule,
    UbicacionesSifenModule,
    EstadoFacturaElectronicaModule,
    NotasCreditoModule,
    SifenUtilsModule,
    UtilModule,
    TimbradosModule,
    CuotasGruposModule,
    ClientesTipoModule,
    AjustesExistenciasModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppInitService
  ],
})
export class AppModule {}
