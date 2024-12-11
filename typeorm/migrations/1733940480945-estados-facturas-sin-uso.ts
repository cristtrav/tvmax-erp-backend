import { MigrationInterface, QueryRunner } from "typeorm";

export class EstadosFacturasSinUso1733940480945 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DELETE FROM facturacion.estado_documento_sifen WHERE id in (5, 31)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `INSERT INTO facturacion.estado_documento_sifen(id, descripcion)
            VALUES (5, 'Invalidado'),(31, 'Anulado - No enviado')`
        );
    }

}
