import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisoCantidadDetalleVenta1735851774926 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.funcionalidad(id, idmodulo, nombre, descripcion, eliminado)
            VALUES(270, 14, 'Modificar cantidades', 'Permite editar la cantidad en el detalle de la factura', false)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 270;`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 270;`)
    }

}
