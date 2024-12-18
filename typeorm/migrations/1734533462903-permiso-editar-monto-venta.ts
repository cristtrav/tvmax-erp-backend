import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisoEditarMontoVenta1734533462903 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.funcionalidad(id, idmodulo, nombre, descripcion, eliminado)
            VALUES(268, 14, 'Modificar montos', 'Permite editar los montos en el detalle de la factura', false)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 268`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 268`);
    }

}
