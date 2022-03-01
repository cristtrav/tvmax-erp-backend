import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { FacturaVenta } from '@dto/factura-venta.dto';
import { Client } from 'pg';
import { DetalleFacturaVenta } from '@dto/detalle-factura-venta-dto';
import { ClientesService } from '../clientes/clientes.service';
import { WhereParam } from '@util/whereparam';
import { ISearchField } from '@util/isearchfield.interface';
import { IRangeQuery } from '@util/irangequery.interface';
import { AuditQueryHelper } from '@util/audit-query-helper';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { ResumenCantMonto } from '@dto/resumen-cant-monto.dto';

@Injectable()
export class VentasService {

    constructor(
        private dbsrv: DatabaseService,
        private clienteSrv: ClientesService
    ) { }

    async create(fv: FacturaVenta, registraCobro: boolean, idusu: number): Promise<number> {
        const dbcli: Client = await this.dbsrv.getDBClient();
        const queryCabecera: string = `INSERT INTO public.factura_venta (id, idcliente, fecha_factura, pagado, anulado, idtimbrado, nro_factura, fecha_cobro, idcobrador_comision, idusuario_registro_factura, idusuario_registro_cobro, eliminado)
        VALUES(nextval('public.seq_factura_venta'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false) RETURNING *`;
        const paramsCabecera: any[] = [fv.idcliente, fv.fechafactura, fv.pagado, fv.anulado, fv.idtimbrado, fv.nrofactura, fv.fechacobro, fv.idcobradorcomision, fv.idusuarioregistrofactura, fv.idusuarioregistrocobro];
        try {
            await dbcli.query('BEGIN');
            const res = await dbcli.query(queryCabecera, paramsCabecera);
        
            const idgenerado = res.rows[0].id;
            await AuditQueryHelper.auditPostInsert(dbcli, TablasAuditoriaList.FACTURAVENTA, idusu, idgenerado);
            for (let dv of fv.detalles) {
                const queryDetalle: string = `INSERT INTO public.detalle_factura_venta(id, idfactura_venta, monto, cantidad, subtotal, descripcion, porcentaje_iva, idservicio, idcuota, idsuscripcion, eliminado)
                VALUES(nextval('public.seq_detalle_factura_venta'), $1, $2, $3, $4, $5, $6, $7, $8, $9, false) RETURNING *`;
                const paramsDetalle: any[] = [idgenerado, dv.monto, dv.cantidad, dv.subtotal, dv.descripcion, dv.porcentajeiva, dv.idservicio, dv.idcuota, dv.idsuscripcion];
                const idddetalle = (await dbcli.query(queryDetalle, paramsDetalle)).rows[0].id;
                await AuditQueryHelper.auditPostInsert(dbcli, TablasAuditoriaList.DETALLEFACTURAVENTA, idusu, idddetalle);
            }
            
            const queryTimbrado: string = `UPDATE public.timbrado SET ultimo_nro_usado = $1 WHERE id = $2`;
            const paramsTimbrado: any[] = [fv.nrofactura, fv.idtimbrado];;
            const idevento = await AuditQueryHelper.auditPreUpdate(dbcli, TablasAuditoriaList.TIMBRADOS, idusu, fv.idtimbrado);
            await dbcli.query(queryTimbrado, paramsTimbrado);
            await AuditQueryHelper.auditPostUpdate(dbcli, TablasAuditoriaList.TIMBRADOS, idevento, fv.idtimbrado);
            
            /*if (registraCobro) {
                const clie: Cliente = await this.clienteSrv.findById(fv.idcliente);
                const queryCobro: String = `INSERT INTO public.cobro(id, idfactura, fecha, cobrado_por, comision_para, anulado, eliminado)
                VALUES(nextval('public.seq_cobros'), $1, $2, $3, $4, false, false)`;
                const paramsCobro: any[] = [idgenerado, fv.fechafactura, idusu, clie.idcobrador];
                await dbcli.query(queryCobro, paramsCobro);
            }*/

            await dbcli.query('COMMIT');
            return idgenerado;
        } catch (e) {
            await dbcli.query('ROLLBACK');
            throw e;
        } finally {
            dbcli.release();
        }
    }

    async findAll(params): Promise<FacturaVenta[]> {
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
            fechafincobro,
            sort,
            offset,
            limit 
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
            { sort, offset, limit }
        );
        let query: string = `SELECT * FROM public.vw_facturas_venta ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        const rows: FacturaVenta[] = (await this.dbsrv.execute(query, wp.whereParams)).rows;
        for (let fv of rows) {
            const queryDetalle: string = `SELECT * FROM public.vw_detalles_factura_venta WHERE eliminado = false AND idfacturaventa = $1`;
            const detalles: DetalleFacturaVenta[] = (await this.dbsrv.execute(queryDetalle, [fv.id])).rows;
            fv.detalles = detalles;

            /*const queryCobro: string = `SELECT * FROM public.vw_cobros WHERE eliminado = false AND idfactura = $1`;
            const cobros: Cobro[] = (await this.dbsrv.execute(queryCobro, [fv.id])).rows;
            fv.cobros = cobros;*/
        }
        return rows;
    }

    async count(params): Promise<number> {
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
        let query: string = `SELECT COUNT(*) FROM public.vw_facturas_venta ${wp.whereStr}`;        
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async anular(idventa: number, anulado, idusuario: number): Promise<void> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.factura_venta SET anulado = $1 WHERE id = $2`;
        const params = [anulado, idventa];
        try{
            await cli.query('BEGIN');
            const idevento = await AuditQueryHelper.auditPreUpdate(cli, TablasAuditoriaList.FACTURAVENTA, idusuario, idventa);
            await cli.query(query, params);
            await AuditQueryHelper.auditPostUpdate(cli, TablasAuditoriaList.FACTURAVENTA, idevento, idventa);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
        }finally{
            cli.release();
        }
    }

    async delete(id: number, idusuario: number): Promise<boolean> {
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.factura_venta SET eliminado = true WHERE id = $1`;
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, [id])).rowCount;
            AuditQueryHelper.auditPostDelete(cli, TablasAuditoriaList.FACTURAVENTA, idusuario, id);
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return rowCount > 0;
    }

    async findById(id: number): Promise<FacturaVenta>{
        const wp: WhereParam = new WhereParam(
            { id },
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT * FROM public.vw_facturas_venta ${wp.whereStr}`;
        const rows: FacturaVenta[] = (await this.dbsrv.execute(query, wp.whereParams)).rows;
        if(rows.length > 0){
            const fv: FacturaVenta = rows[0];
            const queryDetalle: string = `SELECT * FROM public.vw_detalles_factura_venta WHERE eliminado = false AND idfacturaventa = $1`;
            const detalles: DetalleFacturaVenta[] = (await this.dbsrv.execute(queryDetalle, [fv.id])).rows;
            fv.detalles = detalles;
            return fv;
        };
        return null;
    }

}
