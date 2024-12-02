import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisosPosMovil1731511462823 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.modulo(id, descripcion, eliminado)
            VALUES(40, 'POS Movil', false)`
        );
        await queryRunner.query(
            `INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado)
            VALUES(1180, 40, 'Acceso al módulo', false)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 1180`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 1180`);
        await queryRunner.query(`DELETE FROM public.modulo WHERE id = 40`);
    }

}
