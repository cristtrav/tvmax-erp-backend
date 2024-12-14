import { MigrationInterface, QueryRunner } from "typeorm";

export class EstadoLoteFactura1734196518354 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.lote_factura
                ADD COLUMN codigo_estado character varying(10);

            ALTER TABLE IF EXISTS facturacion.lote_factura
                ADD COLUMN descripcion character varying(200);`
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.lote_factura RENAME TO detalle_lote;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE IF EXISTS facturacion.detalle_lote RENAME TO lote_factura;`);
        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.lote_factura DROP COLUMN IF EXISTS codigo_estado;
            ALTER TABLE IF EXISTS facturacion.lote_factura DROP COLUMN IF EXISTS descripcion;`
        );
        
    }

}
