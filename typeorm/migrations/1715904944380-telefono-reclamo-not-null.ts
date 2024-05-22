import { MigrationInterface, QueryRunner } from "typeorm";

export class TelefonoReclamoNotNull1715904944380 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo ALTER COLUMN telefono SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo ALTER COLUMN telefono DROP NOT NULL`);
    }

}
