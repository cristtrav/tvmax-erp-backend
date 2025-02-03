import { MigrationInterface, QueryRunner } from "typeorm";

export class VistaLoteDetalle1738461694726 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_detalles_lotes;`)
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_lotes_detalles AS
            SELECT
                lote_detalle.iddte,
                lote_detalle.idlote,
                dte.tipo_documento AS tipodocumento,
                lote_detalle.codigo_estado AS codigoestado,
                lote_detalle.descripcion,
                CASE 
                    WHEN dte.tipo_documento = 'FAC' THEN talon_venta.nro_timbrado
                    WHEN dte.tipo_documento = 'NCR' THEN talon_nota.nro_timbrado
                    ELSE NULL
                END AS nrotimbrado,
                CASE
                    WHEN dte.tipo_documento = 'FAC' THEN 
                    concat(
                        to_char(talon_venta.cod_establecimiento::integer, 'fm000'::text),
                        '-',
                        to_char(talon_venta.cod_punto_emision::integer, 'fm000'::text),
                        '-',
                        to_char(venta.nro_factura::integer, 'fm0000000'::text)
                    )
                    WHEN dte.tipo_documento = 'NCR' THEN
                    concat(
                        to_char(talon_nota.cod_establecimiento::integer, 'fm000'::text),
                        '-',
                        to_char(talon_nota.cod_punto_emision::integer, 'fm000'::text),
                        '-',
                        to_char(nota_credito.nro_nota::integer, 'fm0000000'::text)
                    )
                    ELSE NULL
                END AS nrodocumento,
                CASE
                    WHEN dte.tipo_documento = 'FAC' THEN venta.id
                    WHEN dte.tipo_documento = 'NCR' THEN nota_credito.id
                    ELSE NULL
                END AS iddocumento,
                CASE
                    WHEN dte.tipo_documento = 'FAC' AND venta.fecha_hora_factura IS NOT NULL THEN venta.fecha_hora_factura
                    WHEN dte.tipo_documento = 'FAC' AND venta.fecha_factura IS NOT NULL THEN venta.fecha_factura
                    WHEN dte.tipo_documento = 'NCR' THEN nota_credito.fecha_hora
                    ELSE NULL
                END AS fechadocumento
            FROM facturacion.lote_detalle
            JOIN facturacion.dte ON lote_detalle.iddte = dte.id
            LEFT JOIN venta ON venta.iddte = lote_detalle.iddte
            LEFT JOIN facturacion.talonario talon_venta ON talon_venta.id = venta.idtalonario
            LEFT JOIN facturacion.nota_credito ON lote_detalle.iddte = nota_credito.iddte
            LEFT JOIN facturacion.talonario talon_nota ON talon_nota.id = nota_credito.idtalonario`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_lotes_detalles;`);
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_detalles_lotes AS
             SELECT lote_detalle.iddte,
                lote_detalle.idlote,
                lote_detalle.codigo_estado AS codigoestado,
                lote_detalle.descripcion,
                talonario.nro_timbrado AS nrotimbrado,
                concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text)) AS prefijofactura,
                venta.id AS idventa,
                venta.nro_factura AS nrofactura,
                venta.fecha_factura AS fechafactura,
                venta.fecha_hora_factura AS fechahorafactura
            FROM facturacion.lote_detalle
                JOIN venta ON venta.iddte = lote_detalle.iddte
                JOIN facturacion.talonario ON talonario.id = venta.idtalonario;`
        );
    }

}
