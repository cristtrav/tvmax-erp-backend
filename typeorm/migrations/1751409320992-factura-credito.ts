import { MigrationInterface, QueryRunner } from "typeorm";

export class FacturaCredito1751409320992 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);

        await queryRunner.query(`CREATE TYPE public.condicion_venta_type AS ENUM ('CON', 'CRE');`);
        await queryRunner.query(`ALTER TABLE IF EXISTS public.venta ADD COLUMN condicion condicion_venta_type NOT NULL DEFAULT 'CON';`);
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas AS
             SELECT
                venta.id,
                venta.condicion,
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
                venta.idtalonario,
                talonario.nro_timbrado AS timbrado,
                timbrado.fecha_vencimiento AS vencimientotimbrado,
                timbrado.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtalonario IS NOT NULL THEN concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text))
                        ELSE NULL::text
                    END AS prefijofactura,
                timbrado.electronico AS facturaelectronica,
                cobro.comision_para AS idcobradorcomision,
                btrim(concat(cobrador.nombres, ' ', cobrador.apellidos)) AS cobrador,
                cobro.fecha AS fechacobro,
                venta.idusuario_registro_factura AS idusuarioregistrofactura,
                btrim(concat(usuariofactura.nombres, ' ', usuariofactura.apellidos)) AS usuarioregistrofactura,
                cobro.cobrado_por AS idusuarioregistrocobro,
                btrim(concat(usuariocobro.nombres, ' ', usuariocobro.apellidos)) AS usuarioregistrocobro,
                venta.iddte,
                dte.idestado_documento_sifen AS idestadodte,
                dte.fecha_cambio_estado AS fechacambioestadodte,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN facturacion.talonario ON talonario.id = venta.idtalonario
                LEFT JOIN facturacion.timbrado ON timbrado.nro_timbrado = talonario.nro_timbrado
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id
                LEFT JOIN facturacion.dte ON dte.id = venta.iddte`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);

        await queryRunner.query(`ALTER TABLE IF EXISTS public.venta DROP COLUMN IF EXISTS condicion;`);
        await queryRunner.query(`DROP TYPE IF EXISTS public.condicion_venta_type;`);
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas AS
             SELECT
                venta.id,
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
                venta.idtalonario,
                talonario.nro_timbrado AS timbrado,
                timbrado.fecha_vencimiento AS vencimientotimbrado,
                timbrado.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtalonario IS NOT NULL THEN concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text))
                        ELSE NULL::text
                    END AS prefijofactura,
                timbrado.electronico AS facturaelectronica,
                cobro.comision_para AS idcobradorcomision,
                btrim(concat(cobrador.nombres, ' ', cobrador.apellidos)) AS cobrador,
                cobro.fecha AS fechacobro,
                venta.idusuario_registro_factura AS idusuarioregistrofactura,
                btrim(concat(usuariofactura.nombres, ' ', usuariofactura.apellidos)) AS usuarioregistrofactura,
                cobro.cobrado_por AS idusuarioregistrocobro,
                btrim(concat(usuariocobro.nombres, ' ', usuariocobro.apellidos)) AS usuarioregistrocobro,
                venta.iddte,
                dte.idestado_documento_sifen AS idestadodte,
                dte.fecha_cambio_estado AS fechacambioestadodte,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN facturacion.talonario ON talonario.id = venta.idtalonario
                LEFT JOIN facturacion.timbrado ON timbrado.nro_timbrado = talonario.nro_timbrado
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id
                LEFT JOIN facturacion.dte ON dte.id = venta.iddte`
        );
    }

    private async dropViews(queryRunner: QueryRunner): Promise<void>{
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_ventas;`);
    }

}
