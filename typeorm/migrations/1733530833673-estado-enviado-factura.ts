import { MigrationInterface, QueryRunner } from "typeorm";

export class EstadoEnviadoFactura1733530833673 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO facturacion.estado_documento_sifen(id, descripcion)
            VALUES(32, 'Enviado')`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE facturacion.factura_electronica SET idestado_documento_sifen = 30
            WHERE idestado_documento_sifen = 32`
        );
        await queryRunner.query(
            `DELETE FROM facturacion.estado_documento_sifen WHERE id = 32`
        );
    }

}
