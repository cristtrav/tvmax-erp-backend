import { DatabaseService } from '@database/database.service';
import { DetalleVentaCobro } from '@dto/detalle-venta-cobro.dto';
import { DetalleVentaDTO } from '@dto/detalle-venta-dto';
import { Injectable } from '@nestjs/common';
import { IRangeQuery } from '@util/irangequery.interface';
import { ISearchField } from '@util/isearchfield.interface';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class DetallesVentasService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findByIdVenta(idventa: number): Promise<DetalleVentaDTO[]> {
        const eliminado: boolean = false;
        const wp: WhereParam = new WhereParam(
            { idventa, eliminado },
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT * FROM public.vw_detalles_venta ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countByIdVenta(idventa: number): Promise<number> {
        const eliminado: boolean = false;
        const wp: WhereParam = new WhereParam(
            { idventa, eliminado },
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_detalles_venta ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async findAllDetallesCobros(params): Promise<DetalleVentaCobro[]> {        
        const {
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
        } = params;
        const range: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fecha_factura',
                    startValue: fechainiciofactura,
                    endValue: fechafinfactura
                },
                {
                    fieldName: 'fecha_cobro',
                    startValue: fechainiciocobro,
                    endValue: fechafincobro
                }
            ]

        }
        const searches: ISearchField[] = [
            {
                fieldName: 'cliente',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'facturacobro',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'ci',
                exactMatch: true,
                fieldValue: search
            },
            {
                fieldName: 'servicio',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'grupo',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'cobrador',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'usuario',
                exactMatch: false,
                fieldValue: search
            }
        ]
        const wp: WhereParam = new WhereParam(
            {
                eliminado,
                pagado,
                anulado,
                idusuario: idfuncionarioregistrocobro,
                idcobrador: idcobradorcomision,
            },
            {
                idgrupo,
                idservicio
            },
            range,
            searches,
            { sort, offset, limit }
        );
        const query: string = `SELECT * FROM public.vw_detalles_venta_cobros ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countDetallesCobros(params): Promise<number> {
        const {
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
        } = params;
        const range: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fecha_factura',
                    startValue: fechainiciofactura,
                    endValue: fechafinfactura
                },
                {
                    fieldName: 'fecha_cobro',
                    startValue: fechainiciocobro,
                    endValue: fechafincobro
                }
            ]

        }
        const searches: ISearchField[] = [
            {
                fieldName: 'cliente',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'facturacobro',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'ci',
                exactMatch: true,
                fieldValue: search
            },
            {
                fieldName: 'servicio',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'grupo',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'cobrador',
                exactMatch: false,
                fieldValue: search
            },
            {
                fieldName: 'usuario',
                exactMatch: false,
                fieldValue: search
            }
        ]
        const wp: WhereParam = new WhereParam(
            {
                eliminado,
                pagado,
                anulado,
                idusuario: idfuncionarioregistrocobro,
                idcobrador: idcobradorcomision,
            },
            {
                idgrupo,
                idservicio
            },
            range,
            searches,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_detalles_venta_cobros ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }
}
