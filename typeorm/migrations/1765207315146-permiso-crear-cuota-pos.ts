import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisoCrearCuotaPos1765207315146 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.funcionalidad (id, descripcion, idmodulo, nombre, eliminado)
            VALUES(227, 'Permige exonerar o quitar exoneración de las cuotas', 12, 'Gestionar exoneraciones', false);`
        );
        await queryRunner.query(
            `INSERT INTO public.funcionalidad (id, descripcion, idmodulo, nombre, eliminado)
            VALUES(228, 'Permite modificar el monto de las cuotas', 12, 'Editar monto', false);`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad IN (227, 228);`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id IN (227, 228);`);
    }

}
