import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorTimbrados1737051816262 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE IF EXISTS public.timbrado SET SCHEMA facturacion;`);
        await queryRunner.query(`ALTER TABLE IF EXISTS facturacion.timbrado RENAME TO talonario;`);
        await queryRunner.query(`ALTER VIEW IF EXISTS public.vw_timbrados SET SCHEMA facturacion;`);
        await queryRunner.query(`ALTER VIEW IF EXISTS facturacion.vw_timbrados RENAME TO vw_talonarios;`)
        await queryRunner.query(`UPDATE public.modulo SET descripcion = 'Talonarios' WHERE id = 13;`);
        await queryRunner.query(`ALTER TABLE IF EXISTS public.venta RENAME idtimbrado TO idtalonario;`)
        await queryRunner.query(
            `DROP VIEW public.vw_ventas;

            CREATE OR REPLACE VIEW public.vw_ventas
                AS
                SELECT venta.id,
                venta.fecha_factura AS fechafactura,
                venta.fecha_hora_factura AS fechahorafactura,
                venta.total_gravado_iva10 AS totalgravadoiva10,
                venta.total_gravado_iva5 AS totalgravadoiva5,
                venta.total_exento_iva AS totalexentoiva,
                venta.total_iva10 AS totaliva10,
                venta.total_iva5 AS totaliva5,
                venta.total,
                venta.pagado,
                venta.anulado,
                venta.idcliente,
                cliente.razon_social AS cliente,
                cliente.ci,
                cliente.dv_ruc AS dvruc,
                venta.nro_factura AS nrofactura,
                venta.idtalonario AS idtalonario,
                talonario.nro_timbrado AS timbrado,
                talonario.fecha_vencimiento AS vencimientotimbrado,
                talonario.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtalonario IS NOT NULL THEN concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text))
                        ELSE NULL::text
                    END AS prefijofactura,
                talonario.electronico AS facturaelectronica,
                cobro.comision_para AS idcobradorcomision,
                btrim(concat(cobrador.nombres, ' ', cobrador.apellidos)) AS cobrador,
                cobro.fecha AS fechacobro,
                venta.idusuario_registro_factura AS idusuarioregistrofactura,
                btrim(concat(usuariofactura.nombres, ' ', usuariofactura.apellidos)) AS usuarioregistrofactura,
                cobro.cobrado_por AS idusuarioregistrocobro,
                btrim(concat(usuariocobro.nombres, ' ', usuariocobro.apellidos)) AS usuarioregistrocobro,
                factura_electronica.idestado_documento_sifen AS idestadofacturaelectronica,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN facturacion.talonario ON talonario.id = venta.idtalonario
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id
                LEFT JOIN facturacion.factura_electronica ON factura_electronica.idventa = venta.id;`
            );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP VIEW public.vw_ventas;

            CREATE OR REPLACE VIEW public.vw_ventas
                AS
                SELECT venta.id,
                venta.fecha_factura AS fechafactura,
                venta.fecha_hora_factura AS fechahorafactura,
                venta.total_gravado_iva10 AS totalgravadoiva10,
                venta.total_gravado_iva5 AS totalgravadoiva5,
                venta.total_exento_iva AS totalexentoiva,
                venta.total_iva10 AS totaliva10,
                venta.total_iva5 AS totaliva5,
                venta.total,
                venta.pagado,
                venta.anulado,
                venta.idcliente,
                cliente.razon_social AS cliente,
                cliente.ci,
                cliente.dv_ruc AS dvruc,
                venta.nro_factura AS nrofactura,
                venta.idtalonario AS idtimbrado,
                talonario.nro_timbrado AS timbrado,
                talonario.fecha_vencimiento AS vencimientotimbrado,
                talonario.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtalonario IS NOT NULL THEN concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text))
                        ELSE NULL::text
                    END AS prefijofactura,
                talonario.electronico AS facturaelectronica,
                cobro.comision_para AS idcobradorcomision,
                btrim(concat(cobrador.nombres, ' ', cobrador.apellidos)) AS cobrador,
                cobro.fecha AS fechacobro,
                venta.idusuario_registro_factura AS idusuarioregistrofactura,
                btrim(concat(usuariofactura.nombres, ' ', usuariofactura.apellidos)) AS usuarioregistrofactura,
                cobro.cobrado_por AS idusuarioregistrocobro,
                btrim(concat(usuariocobro.nombres, ' ', usuariocobro.apellidos)) AS usuarioregistrocobro,
                factura_electronica.idestado_documento_sifen AS idestadofacturaelectronica,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN facturacion.talonario ON talonario.id = venta.idtalonario
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id
                LEFT JOIN facturacion.factura_electronica ON factura_electronica.idventa = venta.id;`
            );
        await queryRunner.query(`ALTER VIEW IF EXISTS facturacion.vw_talonarios RENAME TO vw_timbrados;`)
        await queryRunner.query(`ALTER VIEW IF EXISTS public.vw_timbrados SET SCHEMA public;`);
        await queryRunner.query(`ALTER TABLE IF EXISTS facturacion.talonario RENAME TO timbrado;`);
        await queryRunner.query(`ALTER TABLE IF EXISTS public.timbrado SET SCHEMA public;`);
        await queryRunner.query(`UPDATE public.modulo SET descripcion = 'Timbrados' WHERE id = 13;`);
        await queryRunner.query(`ALTER TABLE IF EXISTS public.venta RENAME idtalonario TO idtimbrado;`)
        
    }

}
