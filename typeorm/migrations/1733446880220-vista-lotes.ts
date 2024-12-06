import { MigrationInterface, QueryRunner } from "typeorm";

export class VistaLotes1733446880220 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_lotes AS
            SELECT 
                id,
                fecha_hora_creacion AS fechahoracreacion,
                fecha_hora_envio AS fechahoraenvio,
                fecha_hora_consulta AS fechahoraconsulta,
                enviado,
                aceptado,
                consultado,
                nro_lote_sifen AS nrolotesifen,
                observacion,
                COUNT(*) AS cantidadfacturas
            FROM facturacion.lote
            JOIN facturacion.lote_factura ON lote.id = lote_factura.idlote
            GROUP BY id;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_lotes`);
    }

}
