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
import { Departamento } from '@database/entity/departamento.entity';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { Distrito } from '@database/entity/distrito.entity';
import { DistritoView } from '@database/view/distritos.view';
import { Barrio } from '@database/entity/barrio.entity';
import { BarrioView } from '@database/view/barrio.view';
import { Grupo } from '@database/entity/grupo.entity';
import { Servicio } from '@database/entity/servicio.entity';
import { ServicioView } from '@database/view/servicio.view';
import { Cuota } from '@database/entity/cuota.entity';
import { CuotaView } from '@database/view/cuota.view';
import { Rol } from '@database/entity/rol.entity';
import { RolesModule } from './modulos/roles/roles.module';
import { Usuario } from '@database/entity/usuario.entity';
import { UsuarioView } from '@database/view/usuario.view';
import { Sesion } from '@database/entity/sesion.entity';
import { RolView } from '@database/view/rol.view';
import { Timbrado } from '@database/entity/timbrado.entity';
import { TimbradoView } from '@database/view/timbrado.view';
import { Cliente } from '@database/entity/cliente.entity';
import { ClienteView } from '@database/view/cliente.view';
import { Domicilio } from '@database/entity/domicilio.entity';
import { DomicilioView } from '@database/view/domicilio.view';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { ResumenesSuscripcionesModule } from './modulos/estadisticas/resumenes-suscripciones/resumenes-suscripciones.module';
import { Permiso } from '@database/entity/permiso.entity';
import { Venta } from '@database/entity/venta.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { VentaView } from '@database/view/venta.view';
import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { Cobro } from '@database/entity/cobro.entity';
import { CobroDetalleVentaView } from '@database/view/cobro-detalle-venta.view';
import { CobrosModule } from './modulos/cobros/cobros.module';
import { Funcionalidad } from '@database/entity/funcionalidad.entity';
import { Modulo } from '@database/entity/modulo.entity';
import { ResumenesVentasModule } from './modulos/estadisticas/resumenes-ventas/resumenes-ventas.module';
import { EventoAuditoriaView } from '@database/view/evento-auditoria.view';
import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';
import { FormatoFacturasModule } from './modulos/formato-facturas/formato-facturas.module';
import { FormatoFactura } from '@database/entity/formato-factura.entity';
import { CobranzaExternaModule } from './modulos/cobranza-externa/cobranza-externa.module';
import { ConsultaCobranzaExterna } from '@database/entity/consulta-cobranza-externa.entity';
import { DetalleConsultaCobranzaExterna } from '@database/entity/detalle-consulta-cobranza-externa.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './global/tasks/tasks.module';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
      entities: [
        Departamento,
        Distrito, DistritoView,
        Barrio, BarrioView,
        Grupo,
        Servicio, ServicioView,
        EventoAuditoria, EventoAuditoriaView, TablaAuditoria,
        Cuota, CuotaView,
        Usuario, UsuarioView,
        Rol, RolView,
        Sesion,
        Timbrado, TimbradoView,
        Cliente, ClienteView,
        Domicilio, DomicilioView,
        Suscripcion, SuscripcionView,
        Permiso, Funcionalidad, Modulo,
        Venta, DetalleVenta, VentaView, DetalleVentaView,
        Cobro, CobroCuotasView, CobroDetalleVentaView,
        FormatoFactura,
        ConsultaCobranzaExterna, DetalleConsultaCobranzaExterna,
        GeneracionCuotas
      ]
    }),
    TasksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
