import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { FacturaVenta } from '@dto/factura-venta.dto';
import { Client } from 'pg';
import { IWhereParam } from '@util/iwhereparam.interface';
import { Util } from '@util/util';
import { DetalleFacturaVenta } from '@dto/detalle-factura-venta-dto';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';
import { ClientesService } from '../clientes/clientes.service';
import { Cliente } from '@dto/cliente.dto';
import { Cobro } from '@dto/cobro.dto';

@Injectable()
export class VentasService {

    constructor(
        private dbsrv: DatabaseService,
        private clienteSrv: ClientesService
    ) { }

    async create(fv: FacturaVenta, registraCobro: boolean, idusu: number): Promise<number> {
        const dbcli: Client = await this.dbsrv.getDBClient();
        const queryCabecera: string = `INSERT INTO public.factura_venta (id, idcliente, total, fecha, pagado, anulado, idtimbrado, nro_factura, exento, iva5, iva10, fecha_cobro, idcobrador_comision, idusuario_registro_factura, idusuario_registro_cobro, eliminado)
        VALUES(nextval('public.seq_factura_venta'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false) RETURNING *`;
        const paramsCabecera: any[] = [fv.idcliente, fv.total, fv.fechafactura, fv.pagado, fv.anulado, fv.idtimbrado, fv.nrofactura, fv.exento, fv.iva5, fv.iva10, fv.fechacobro, fv.idcobradorcomision, fv.idusuarioregistrofactura, fv.idusuarioregistrocobro];
        try {
            await dbcli.query('BEGIN');
            const res = await dbcli.query(queryCabecera, paramsCabecera);
            const idgenerado = res.rows[0].id;
            for (let dv of fv.detalles) {
                const queryDetalle: string = `INSERT INTO public.detalle_factura_venta(id, idfactura_venta, monto, cantidad, subtotal, descripcion, porcentaje_iva, idservicio, idcuota, idsuscripcion, eliminado)
                VALUES(nextval('public.seq_detalle_factura_venta'), $1, $2, $3, $4, $5, $6, $7, $8, $9, false)`;
                const paramsDetalle: any[] = [idgenerado, dv.monto, dv.cantidad, dv.subtotal, dv.descripcion, dv.porcentajeiva, dv.idservicio, dv.idcuota, dv.idsuscripcion];
                await dbcli.query(queryDetalle, paramsDetalle);
            }
            const queryTimbrado: string = `UPDATE public.timbrado SET ultimo_nro_usado = $1 WHERE id = $2`;
            const paramsTimbrado: any[] = [fv.nrofactura, fv.idtimbrado];;
            await dbcli.query(queryTimbrado, paramsTimbrado);

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
        const wp: IWhereParam = Util.buildAndWhereParam(
            {
                eliminado,
                pagado,
                anulado,
                idcobradorcomision,
                idusuarioregistrocobro
            }
        );
        const sof: string = Util.buildSortOffsetLimitStr(sort, offset, limit);
        let query: string = `SELECT * FROM public.vw_facturas_venta ${wp.whereStr}`;
        if (search) {
            if (wp.whereStr) {
                query += ` AND`;
            } else {
                query += ` WHERE`;
            }
            query += ` (LOWER(cliente) LIKE $${wp.lastParamIndex + 1} OR nrofactura::text = $${wp.lastParamIndex + 2})`;
            wp.whereParams.push(`%${search.toLowerCase()}%`);
            wp.whereParams.push(search);
            wp.lastParamIndex = wp.lastParamIndex + 2;
        }
        if (fechainiciofactura) {
            query += ` AND fecha_factura >= $${wp.lastParamIndex + 1}`;
            wp.whereParams.push(fechainiciofactura);
            wp.lastParamIndex = wp.lastParamIndex + 1;
        }
        if (fechafinfactura) {
            query += ` AND fecha_factura <= $${wp.lastParamIndex + 1}`;
            wp.whereParams.push(fechafinfactura);
            wp.lastParamIndex = wp.lastParamIndex + 1;
        }
        if (fechainiciocobro) {
            query += ` AND fecha_cobro >= $${wp.lastParamIndex + 1}`;
            wp.whereParams.push(fechainiciocobro);
            wp.lastParamIndex = wp.lastParamIndex + 1;
        }
        if (fechafincobro) {
            query += ` AND fecha_cobro <= $${wp.lastParamIndex + 1}`;
            wp.whereParams.push(fechafincobro);
            wp.lastParamIndex = wp.lastParamIndex + 1;
        }
        query += ` ${sof}`;
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
        const wp: IWhereParam = Util.buildAndWhereParam({eliminado, pagado, anulado, idcobradorcomision, idusuarioregistrocobro});
        let query: string = `SELECT COUNT(*) FROM public.vw_facturas_venta ${wp.whereStr}`;
        if (search) {
            if (wp.whereStr) {
                query += ` AND`;
            } else {
                query += ` WHERE`;
            }
            query += ` (LOWER(cliente) LIKE $${wp.lastParamIndex + 1} OR nrofactura::text = $${wp.lastParamIndex + 2})`;
            wp.whereParams.push(`%${search.toLowerCase()}%`);
            wp.whereParams.push(search);
            wp.lastParamIndex = wp.lastParamIndex + 2;
        }
        if (fechainiciofactura) {
            query += ` AND fecha_factura >= $${wp.lastParamIndex + 1}`;
            wp.whereParams.push(fechainiciofactura);
            wp.lastParamIndex = wp.lastParamIndex + 1;
        }
        if (fechafinfactura) {
            query += ` AND fecha_factura <= $${wp.lastParamIndex + 1}`;
            wp.whereParams.push(fechafinfactura);
            wp.lastParamIndex = wp.lastParamIndex + 1;
        }
        if (fechainiciocobro) {
            query += ` AND fecha_cobro >= $${wp.lastParamIndex + 1}`;
            wp.whereParams.push(fechainiciocobro);
            wp.lastParamIndex = wp.lastParamIndex + 1;
        }
        if (fechafincobro) {
            query += ` AND fecha_cobro <= $${wp.lastParamIndex + 1}`;
            wp.whereParams.push(fechafincobro);
            wp.lastParamIndex = wp.lastParamIndex + 1;
        }
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async anular(idventa: number, anulado): Promise<void> {
        const query: string = `UPDATE public.factura_venta SET anulado = $1 WHERE id = $2`;
        await this.dbsrv.execute(query, [anulado, idventa]);
    }

    async delete(id: number): Promise<boolean> {
        const query: string = `UPDATE public.factura_venta SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }

}
