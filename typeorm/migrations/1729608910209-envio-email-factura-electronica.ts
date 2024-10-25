import { MigrationInterface, QueryRunner } from "typeorm";

export class EnvioEmailFacturaElectronica1729608910209 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE facturacion.estado_envio_email
            (
                id integer NOT NULL,
                descripcion character varying(80) NOT NULL,
                PRIMARY KEY (id)
            );`
        );

        await queryRunner.query(
            `INSERT INTO facturacion.estado_envio_email(id, descripcion) VALUES(1, 'No enviado');
            INSERT INTO facturacion.estado_envio_email(id, descripcion) VALUES(2, 'Enviado');
            INSERT INTO facturacion.estado_envio_email(id, descripcion) VALUES(3, 'Envio fallido');`
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.factura_electronica
                ADD COLUMN idestado_envio_email integer NOT NULL DEFAULT 1;

            ALTER TABLE IF EXISTS facturacion.factura_electronica
                ADD COLUMN fecha_cambio_estado_envio_email timestamp with time zone NOT NULL DEFAULT NOW();

            ALTER TABLE IF EXISTS facturacion.factura_electronica
                ADD COLUMN intento_envio_email smallint NOT NULL DEFAULT 0;

            ALTER TABLE IF EXISTS facturacion.factura_electronica
                ADD COLUMN observacion_envio_email text;
            ALTER TABLE IF EXISTS facturacion.factura_electronica
                ADD CONSTRAINT fk_factura_electronica_estado_envio_email FOREIGN KEY (idestado_envio_email)
                REFERENCES facturacion.estado_envio_email (id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
                NOT VALID;`
        );
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.factura_electronica DROP COLUMN IF EXISTS idestado_envio_email;

            ALTER TABLE IF EXISTS facturacion.factura_electronica DROP COLUMN IF EXISTS fecha_cambio_estado_envio_email;

            ALTER TABLE IF EXISTS facturacion.factura_electronica DROP COLUMN IF EXISTS intento_envio_email;

            ALTER TABLE IF EXISTS facturacion.factura_electronica DROP COLUMN IF EXISTS observacion_envio_email;
            ALTER TABLE IF EXISTS facturacion.factura_electronica DROP CONSTRAINT IF EXISTS fk_factura_electronica_estado_envio_email;`
        );
        await queryRunner.query(
            `DROP TABLE IF EXISTS facturacion.estado_envio_email`
        );
    }

}
