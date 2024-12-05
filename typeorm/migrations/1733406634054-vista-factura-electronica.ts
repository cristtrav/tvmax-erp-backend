import { MigrationInterface, QueryRunner } from "typeorm";

export class VistaFacturaElectronica1733406634054 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_facturas_electronicas AS
            SELECT
                factura_electronica.idventa,
                factura_electronica.firmado,
                factura_electronica.version,
                factura_electronica.idestado_documento_sifen AS idestadodocumento,
                estado_documento_sifen.descripcion AS estadodocumento,
                factura_electronica.fecha_cambio_estado AS fechacambioestado,
                factura_electronica.observacion AS observaciondocumento,
                factura_electronica.idestado_envio_email AS idestadoemail,
                estado_envio_email.descripcion AS estadoemail,
                factura_electronica.fecha_cambio_estado_envio_email AS fechacambioestadoemail,
                factura_electronica.intento_envio_email AS intentoemail,
                factura_electronica.observacion_envio_email AS observacionemail
            FROM facturacion.factura_electronica
            JOIN facturacion.estado_documento_sifen ON factura_electronica.idestado_documento_sifen = estado_documento_sifen.id
            JOIN facturacion.estado_envio_email ON factura_electronica.idestado_envio_email = estado_envio_email.id`    
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_facturas_electronicas`);
    }

}
