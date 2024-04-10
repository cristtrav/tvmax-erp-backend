import { Permissions } from '@auth/permission.list';
import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';
import { EventoAuditoriaView } from '@database/view/evento-auditoria.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';

@Controller('auditoria')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class AuditoriaController {


  constructor(
    private auditoriaSrv: AuditoriaService
  ) { }

  @Get('eventos')
  @AllowedIn(Permissions.AUDITORIA.CONSULTAREVENTOS)
  findAllEventos(
    @Query() queries: { [name: string]: any }
  ): Promise<EventoAuditoriaView[]> {
    return this.auditoriaSrv.findAllEventos(queries);
  }

  @Get('eventos/total')
  @AllowedIn(Permissions.AUDITORIA.CONSULTAREVENTOS)
  countEventos(
    @Query() queries: { [name: string]: any }
  ): Promise<number> {
    return this.auditoriaSrv.countEventos(queries);
  }

  @Get('tablas')
  @AllowedIn(Permissions.AUDITORIA.ACCESOMODULO)
  findAllTablas(
    @Query() queries: { [name: string]: any }
  ): Promise<TablaAuditoria[]> {
    return this.auditoriaSrv.findAllTablas(queries);
  }

  @Get('tablas/total')
  @AllowedIn(Permissions.AUDITORIA.ACCESOMODULO)
  countTablas(
    @Query() queries: { [name: string]: any }
  ): Promise<number> {
    return this.auditoriaSrv.countTablas(queries);
  }

}
