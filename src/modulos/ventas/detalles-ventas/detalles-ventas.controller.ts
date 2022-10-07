import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { DetalleVentaCobro } from '@dto/detalle-venta-cobro.dto';
import { ServerResponseList } from '@dto/server-response-list.dto';
import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { forkJoin } from 'rxjs';
import { DetallesVentasService } from './detalles-ventas.service';

@Controller('ventas/detalles')
@UseGuards(AuthGuard)
export class DetallesVentasController {

    constructor(
        private detalleVentasSrv: DetallesVentasService
    ) { }

    @Get('cobros')
    @RequirePermission(Permissions.VENTAS.CONSULTAR)
    async findAllDetallesCobros(
        @Query('eliminado') eliminado: boolean,
        @Query('pagado') pagado: boolean,
        @Query('anulado') anulado: boolean,
        @Query('fechainiciofactura') fechainiciofactura: string,
        @Query('fechafinfactura') fechafinfactura: string,
        @Query('fechainiciocobro') fechainiciocobro: string,
        @Query('fechafincobro') fechafincobro: string,
        @Query('idfuncionarioregistrocobro') idfuncionarioregistrocobro: number,
        @Query('idcobradorcomision') idcobradorcomision: number,
        @Query('idgrupo') idgrupo: number,
        @Query('idservicio') idservicio: number,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Query('search') search: string
    ): Promise<ServerResponseList<DetalleVentaCobro>> {
        return new Promise((resolve, reject) => {
            forkJoin({
                rows: this.detalleVentasSrv.findAllDetallesCobros({
                    eliminado,
                    pagado,
                    anulado,
                    fechainiciofactura,
                    fechafinfactura,
                    fechainiciocobro,
                    fechafincobro,
                    idfuncionarioregistrocobro,
                    idcobradorcomision,
                    idgrupo,
                    idservicio,
                    search,
                    sort,
                    offset,
                    limit
                }),
                count: this.detalleVentasSrv.countDetallesCobros({
                    eliminado,
                    pagado,
                    anulado,
                    fechainiciofactura,
                    fechafinfactura,
                    fechainiciocobro,
                    fechafincobro,
                    idfuncionarioregistrocobro,
                    idcobradorcomision,
                    search,
                    idgrupo,
                    idservicio
                })
            }).subscribe({
                next: (resp) => {
                    resolve(new ServerResponseList<DetalleVentaCobro>(resp.rows, resp.count));
                },
                error: (e) => {
                    reject(
                        new HttpException(
                            {
                                request: 'get',
                                description: e.detail ?? e.error ?? e.message
                            },
                            HttpStatus.INTERNAL_SERVER_ERROR
                        )
                    );
                }
            });
        });
    }
}
