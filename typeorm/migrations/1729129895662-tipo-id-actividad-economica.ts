import { MigrationInterface, QueryRunner } from "typeorm";

export class TipoIdActividadEconomica1729129895662 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE facturacion.actividad_economica
            ALTER COLUMN id TYPE varchar(15);`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE facturacion.actividad_economica
            ALTER COLUMN id TYPE integer USING id::integer;`
        );
    }

}
