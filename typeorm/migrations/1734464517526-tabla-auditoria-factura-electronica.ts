import { MigrationInterface, QueryRunner } from "typeorm";

export class TablaAuditoriaFacturaElectronica1734464517526 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `INSERT INTO public.tabla_auditoria(id, descripcion)
            VALUES(38, 'Factura Electrónica')`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.evento_auditoria WHERE idtabla = 38`);
        await queryRunner.query('DELETE FROM public.tabla_auditoria WHERE id = 38');
    }

}
