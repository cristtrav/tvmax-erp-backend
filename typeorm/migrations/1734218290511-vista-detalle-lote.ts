import { MigrationInterface, QueryRunner } from "typeorm";

export class VistaDetalleLote1734218290511 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_detalles_lotes AS
            SELECT
                detalle_lote.idventa,
                detalle_lote.idlote,
                detalle_lote.codigo_estado AS codigoestado,
                detalle_lote.descripcion,
                timbrado.nro_timbrado AS nrotimbrado,
                concat(to_char(timbrado.cod_establecimiento::smallint, 'fm000'::text), '-', to_char(timbrado.cod_punto_emision::smallint, 'fm000'::text)) AS prefijofactura,
                venta.nro_factura AS nrofactura,
                venta.fecha_factura AS fechafactura,
	            venta.fecha_hora_factura AS fechahorafactura
            FROM facturacion.detalle_lote
            JOIN public.venta ON venta.id = detalle_lote.idventa
            JOIN public.timbrado ON timbrado.id = venta.idtimbrado;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP VIEW IF EXISTS facturacion.vw_detalles_lotes;`
        );
    }

}
