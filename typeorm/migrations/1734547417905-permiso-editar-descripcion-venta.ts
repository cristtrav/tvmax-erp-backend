import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisoEditarDescripcionVenta1734547417905 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.funcionalidad(id, idmodulo, nombre, descripcion, eliminado)
            VALUES(269, 14, 'Modificar descripciones', 'Permite editar las descripciones en el detalle de la factura', false)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 269`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 269`);
    }

}
