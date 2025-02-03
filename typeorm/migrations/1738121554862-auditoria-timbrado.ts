import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditoriaTimbrado1738121554862 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.tabla_auditoria(id, descripcion)
            VALUES(39, 'Timbrados');`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.evento_auditoria WHERE idtabla = 39;`);
        await queryRunner.query(`DELETE FROM public.tabla_auditoria WHERE id = 39;`);
    }

}
