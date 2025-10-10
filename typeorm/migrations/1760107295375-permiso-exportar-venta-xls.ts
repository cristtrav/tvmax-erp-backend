import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisoExportarVentaXls1760107295375 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO public.funcionalidad(id, nombre, idmodulo, descripcion, eliminado)
            VALUES(271, 'Exportar XLS', 14, 'Permite exportar las ventas a un archivo Excel', false);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 271`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 271`);
    }

}
