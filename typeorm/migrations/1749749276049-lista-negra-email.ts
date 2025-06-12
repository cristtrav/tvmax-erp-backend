import { MigrationInterface, QueryRunner } from "typeorm";

export class ListaNegraEmail1749749276049 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE facturacion.email_desactivado
            (
                email character varying(200) NOT NULL,
                fecha_hora timestamp with time zone NOT NULL DEFAULT NOW(),
                motivo text,
                PRIMARY KEY (email)
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE facturacion.email_desactivado;`)
    }

}
