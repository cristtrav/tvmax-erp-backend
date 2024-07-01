import { MigrationInterface, QueryRunner } from "typeorm";

export class TributacionExportVentas1718247821599 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO public.modulo(id, descripcion, eliminado) VALUES(35, 'Tributación', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES(980, 'Acceso al Módulo', 35, false)`);
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas_tributacion_exp AS
            SELECT
                1 AS tiporegistro,
                CASE
                    WHEN cliente.dv_ruc IS NULL THEN 12
                    ELSE 11
                END AS tipoidentificacion,
                cliente.ci,
                TO_CHAR(venta.fecha_factura, 'DD/MM/YYYY') AS fecha,
                CASE
                    WHEN cliente.nombres IS NULL AND cliente.apellidos IS NULL THEN cliente.razon_social
                    ELSE razon_social
                END AS razonsocial,
                109 AS tipocomprobante,
                timbrado.nro_timbrado AS nrotimbrado,
                CONCAT(
                    TO_CHAR(timbrado.cod_establecimiento, 'fm000'),
                    '-',
                    TO_CHAR(timbrado.cod_punto_emision, 'fm000'),
                    '-',
                    TO_CHAR(venta.nro_factura, 'fm0000000')
                ) AS nrocomprobante,
                venta.total_gravado_iva10 AS gravadoiva10,
                venta.total_gravado_iva5 AS gravadoiva5,
                venta.total_exento_iva AS exento,
                venta.total,
                1 AS condicion,
                'N' AS monedaextranjera,
                'S' AS imputaIVA,
	            'S' AS imputaIRE,
	            'N' AS imputaIRP
            FROM public.venta
            JOIN public.cliente ON venta.idcliente = cliente.id
            JOIN public.timbrado ON venta.idtimbrado = timbrado.id
            WHERE venta.eliminado = FALSE AND venta.anulado = FALSE
            ORDER BY venta.id, venta.fecha_factura ASC`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 980`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 980`);
        await queryRunner.query(`DELETE FROM public.modulo WHERE id = 35`);
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_ventas_tributacion_exp`);
    }

}
