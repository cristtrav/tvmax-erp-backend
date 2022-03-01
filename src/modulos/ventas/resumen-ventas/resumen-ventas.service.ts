import { DatabaseService } from '@database/database.service';
import { ResumenCantMonto } from '@dto/resumen-cant-monto.dto';
import { Injectable } from '@nestjs/common';
import { IRangeQuery } from '@util/irangequery.interface';
import { ISearchField } from '@util/isearchfield.interface';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class ResumenVentasService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async getResumenGruposServicios(params): Promise<ResumenCantMonto[]>{
        const { 
            eliminado,
            search,
            fechainiciofactura,
            fechafinfactura,
            pagado,
            anulado,
            idcobradorcomision,
            idusuarioregistrocobro,
            fechainiciocobro,
            fechafincobro
        } = params;
        const searchQuery: ISearchField[] = [
            {
                fieldName: 'cliente',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'nrofactura',
                fieldValue: search,
                exactMatch: true
            }
        ];
        
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechafactura::date',
                    startValue: fechainiciofactura,
                    endValue: fechafinfactura
                },
                {
                    fieldName: 'fechacobro::date',
                    startValue: fechainiciocobro,
                    endValue: fechafincobro
                }
            ]
        }
        const wp: WhereParam = new WhereParam(
            {
                'vw_facturas_venta.eliminado': eliminado,
                'vw_detalles_factura_venta.eliminado': false,
                pagado,
                anulado,
                idcobradorcomision,
                idusuarioregistrocobro
            },
            null,
            rangeQuery,
            searchQuery,
            null
        );
        const queryGrupos: string = `SELECT 
        vw_detalles_factura_venta.idgrupo AS idreferencia,
        vw_detalles_factura_venta.grupo AS referencia,
        SUM(vw_detalles_factura_venta.subtotal) AS monto,
        COUNT(*) As cantidad
        FROM public.vw_detalles_factura_venta
        JOIN public.vw_facturas_venta ON vw_detalles_factura_venta.idfacturaventa = vw_facturas_venta.id
        ${wp.whereStr}
        GROUP BY idreferencia, referencia`;
        const rowsGrupos: ResumenCantMonto[] = (await this.dbsrv.execute(queryGrupos, wp.whereParams)).rows;
        
        const queryServicios = `SELECT 
        vw_detalles_factura_venta.idservicio AS idreferencia,
        vw_detalles_factura_venta.servicio AS referencia,
        vw_detalles_factura_venta.idgrupo AS idgrupo,
        SUM(vw_detalles_factura_venta.subtotal) AS monto,
        COUNT(*) As cantidad
        FROM public.vw_detalles_factura_venta
        JOIN public.vw_facturas_venta ON vw_detalles_factura_venta.idfacturaventa = vw_facturas_venta.id
        ${wp.whereStr}
        GROUP BY idreferencia, referencia, idgrupo
        ORDER BY referencia ASC`;
        const rowsServicios = (await this.dbsrv.execute(queryServicios, wp.whereParams)).rows;
        for(let rg of rowsGrupos){
            if(!rg.children) rg.children = [];
            for(let rs of rowsServicios){
                if(rs.idgrupo == rg.idreferencia) rg.children.push(rs);
            }
        }
        return rowsGrupos;
    }

    async getMontoTotal(params): Promise<number> {
        const { 
            eliminado,
            fechainiciofactura,
            fechafinfactura,
            search,
            pagado,
            anulado,
            idcobradorcomision,
            idusuarioregistrocobro,
            fechainiciocobro,
            fechafincobro
        } = params;
        const searchQuery: ISearchField[] = [
            {
                fieldName: 'cliente',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'nrofactura',
                fieldValue: search,
                exactMatch: true
            }
        ];
        
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechafactura::date',
                    startValue: fechainiciofactura,
                    endValue: fechafinfactura
                },
                {
                    fieldName: 'fechacobro::date',
                    startValue: fechainiciocobro,
                    endValue: fechafincobro
                }
            ]
        }
        const wp: WhereParam = new WhereParam(
            {
                eliminado,
                pagado,
                anulado,
                idcobradorcomision,
                idusuarioregistrocobro
            },
            null,
            rangeQuery,
            searchQuery,
            null
        );
        let query: string = `SELECT SUM(vw_facturas_venta.total) FROM public.vw_facturas_venta ${wp.whereStr}`;        
        const rowsSum = (await this.dbsrv.execute(query, wp.whereParams)).rows;
        return rowsSum[0].sum ? rowsSum[0].sum:0;    
    }

    async getResumenCobradores(params): Promise<ResumenCantMonto[]>{
        const { 
            eliminado,
            search,
            fechainiciofactura,
            fechafinfactura,
            pagado,
            anulado,
            idcobradorcomision,
            idusuarioregistrocobro,
            fechainiciocobro,
            fechafincobro
        } = params;
        const searchQuery: ISearchField[] = [
            {
                fieldName: 'cliente',
                fieldValue: search,
                exactMatch: false
            },
            {
                fieldName: 'nrofactura',
                fieldValue: search,
                exactMatch: true
            }
        ];
        
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechafactura::date',
                    startValue: fechainiciofactura,
                    endValue: fechafinfactura
                },
                {
                    fieldName: 'fechacobro::date',
                    startValue: fechainiciocobro,
                    endValue: fechafincobro
                }
            ]
        }
        const wp: WhereParam = new WhereParam(
            {
                eliminado,
                pagado,
                anulado,
                idcobradorcomision,
                idusuarioregistrocobro
            },
            null,
            rangeQuery,
            searchQuery,
            null
        );
        const query: string = `SELECT
        vw_facturas_venta.idcobradorcomision AS idreferencia,
        vw_facturas_venta.cobrador AS referencia,
        COUNT(*) AS cantidad,
        SUM(total) AS monto
        FROM public.vw_facturas_venta
        ${wp.whereStr}
        GROUP BY idreferencia, referencia
        ORDER BY referencia ASC`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

}
