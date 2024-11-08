import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisosActualizacionContacto1730993990690 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.funcionalidad(id, idmodulo, nombre, descripcion, eliminado)
            VALUES(187, 10, 'Actualizar contacto', 'Permite actualizar los datos de teléfono y email de los clientes', false)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 187`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 187`);
    }

}
