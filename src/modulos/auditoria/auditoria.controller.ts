import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';
import { EventoAuditoriaView } from '@database/view/evento-auditoria.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class AuditoriaController {


  constructor(
    private auditoriaSrv: AuditoriaService
  ) { }

  @Get('eventos')
  @RequirePermission(Permissions.AUDITORIA.CONSULTAREVENTOS)
  findAllEventos(
    @Query() queries: { [name: string]: any }
  ): Promise<EventoAuditoriaView[]> {
    return this.auditoriaSrv.findAllEventos(queries);
  }

  @Get('eventos/total')
  @RequirePermission(Permissions.AUDITORIA.CONSULTAREVENTOS)
  countEventos(
    @Query() queries: { [name: string]: any }
  ): Promise<number> {
    return this.auditoriaSrv.countEventos(queries);
  }

  @Get('tablas')
  @RequirePermission(Permissions.AUDITORIA.CONSULTAREVENTOS)
  findAllTablas(
    @Query() queries: { [name: string]: any }
  ): Promise<TablaAuditoria[]> {
    return this.auditoriaSrv.findAllTablas(queries);
  }

  @Get('tablas/total')
  @RequirePermission(Permissions.AUDITORIA.CONSULTAREVENTOS)
  countTablas(
    @Query() queries: { [name: string]: any }
  ): Promise<number> {
    return this.auditoriaSrv.countTablas(queries);
  }

}
