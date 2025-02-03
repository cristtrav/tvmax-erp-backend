import { MigrationInterface, QueryRunner } from "typeorm";

export class VistaDte1738437415474 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_facturas_electronicas`);
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_dte AS
             SELECT
                dte.id,
                dte.tipo_documento AS tipodocumento,
                dte.firmado,
                dte.version,
                dte.idestado_documento_sifen AS idestadodocumento,
                estado_documento_sifen.descripcion AS estadodocumento,
                dte.fecha_cambio_estado AS fechacambioestado,
                dte.observacion AS observaciondocumento,
                dte.idestado_envio_email AS idestadoemail,
                estado_envio_email.descripcion AS estadoemail,
                dte.fecha_cambio_estado_envio_email AS fechacambioestadoemail,
                dte.intento_envio_email AS intentoemail,
                dte.observacion_envio_email AS observacionemail
            FROM facturacion.dte
            JOIN facturacion.estado_documento_sifen ON dte.idestado_documento_sifen = estado_documento_sifen.id
            JOIN facturacion.estado_envio_email ON dte.idestado_envio_email = estado_envio_email.id;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_dte;`)
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_facturas_electronicas AS
            SELECT
                dte.id,
                venta.id AS idventa,
                dte.firmado,
                dte.version,
                dte.idestado_documento_sifen AS idestadodocumento,
                estado_documento_sifen.descripcion AS estadodocumento,
                dte.fecha_cambio_estado AS fechacambioestado,
                dte.observacion AS observaciondocumento,
                dte.idestado_envio_email AS idestadoemail,
                estado_envio_email.descripcion AS estadoemail,
                dte.fecha_cambio_estado_envio_email AS fechacambioestadoemail,
                dte.intento_envio_email AS intentoemail,
                dte.observacion_envio_email AS observacionemail
            FROM facturacion.dte
                JOIN facturacion.estado_documento_sifen ON dte.idestado_documento_sifen = estado_documento_sifen.id
                JOIN facturacion.estado_envio_email ON dte.idestado_envio_email = estado_envio_email.id
                JOIN venta ON venta.iddte = dte.id;`
        );
    }
    
}
