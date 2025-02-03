import { MigrationInterface, QueryRunner } from "typeorm";

export class VistaTimbrado1738121562440 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_timbrados AS
            SELECT
                timbrado.nro_timbrado AS nrotimbrado,
                timbrado.fecha_inicio_vigencia AS fechainiciovigencia,
                timbrado.fecha_vencimiento AS fechavencimiento,
                timbrado.electronico,
                timbrado.activo,
                timbrado.eliminado,
                COUNT(talonario.id) AS nrotalonarios
            FROM facturacion.timbrado
            LEFT JOIN facturacion.talonario ON talonario.nro_timbrado = timbrado.nro_timbrado AND talonario.eliminado = false
            GROUP BY timbrado.nro_timbrado;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_timbrados;`);
    }

}
