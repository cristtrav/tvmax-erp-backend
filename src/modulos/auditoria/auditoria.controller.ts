import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { EventoAuditoria } from '@dto/evento-auditoria.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { TablaAuditoria } from '@dto/tabla-auditoria.dto';
import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
@UseGuards(AuthGuard)
export class AuditoriaController {


  constructor(
    private auditoriaSrv: AuditoriaService
  ) { }

  @Get('eventos')
  @RequirePermission(Permissions.AUDITORIA.CONSULTAREVENTOS)
  async findAllEventos(
    @Query('sort') sort: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('idusuario') idusuario: number,
    @Query('idtabla') idtabla: number,
    @Query('fechahoradesde') fechahoradesde: string,
    @Query('fechahorahasta') fechahorahasta: string,
    @Query('operacion') operacion: string | string[],
    @Query('search') search: string
  ): Promise<ServerResponseList<EventoAuditoria>> {
    try {
      const rows: EventoAuditoria[] = await this.auditoriaSrv.findAllEventos(
        { sort, offset, limit, idusuario, idtabla, fechahoradesde, fechahorahasta, operacion, search }
      );
      const count: number = await this.auditoriaSrv.countEventos(
        { idusuario, idtabla, fechahoradesde, fechahorahasta, operacion, search }
      );
      return new ServerResponseList(rows, count);
    } catch (e) {
      console.log('Error al consultar eventos de auditoria');
      console.log(e);
      throw new HttpException(
        {
          request: 'get',
          description: e.detail ?? e.error ?? e.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('tablas')
  @RequirePermission(Permissions.AUDITORIA.CONSULTAREVENTOS)
  async findAllTablas(
    @Query('sort') sort: string,
    @Query('offset') offset: number,
    @Query('limit') limit: number
  ):Promise<ServerResponseList<TablaAuditoria>>{
    try {
      const rows: TablaAuditoria[] = await this.auditoriaSrv.findAllTablas({ sort, offset, limit });
      const count: number = await this.auditoriaSrv.countTablas({});
      return new ServerResponseList(rows, count);
    } catch (e) {
      console.log('Error al consultar tablas de auditoria');
      console.log(e);
      throw new HttpException(
        {
          request: 'get',
          description: e.detail ?? e.error ?? e.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}
