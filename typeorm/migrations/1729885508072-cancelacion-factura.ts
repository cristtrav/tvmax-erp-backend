import { MigrationInterface, QueryRunner } from "typeorm";

export class CancelacionFactura1729885508072 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE facturacion.seq_id_evento_sifen`);
        await queryRunner.query(
            `CREATE TABLE facturacion.cancelacion_factura
            (
                id bigint NOT NULL,
                idventa integer NOT NULL,
                fecha_hora timestamp with time zone NOT NULL DEFAULT NOW(),
                fecha_hora_envio timestamp without time zone,
                envio_correcto boolean NOT NULL DEFAULT false,
                documento xml NOT NULL,
                observacion text,
                CONSTRAINT pkey_cancelacion PRIMARY KEY (id),
                CONSTRAINT fk_cancelacion_factura_electronica FOREIGN KEY (idventa)
                    REFERENCES facturacion.factura_electronica (idventa) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SEQUENCE IF EXISTS facturacion.seq_id_evento_sifen`);
        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.cancelacion_factura`);
    }

}
