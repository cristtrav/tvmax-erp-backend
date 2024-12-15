import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisoSincronizarSifen1734235412226 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.funcionalidad(id, idmodulo, nombre, descripcion, eliminado)
            VALUES(267, 14, 'Sincronizar con SIFEN', 'Permite consultar el estado de la factura electrónica y actualizar el estado de la misma', false)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM public.permiso WHERE idfuncionalidad = 267`
        );
        await queryRunner.query(
            `DELETE FROM public.funcionalidad WHERE id = 267`
        );
    }

}
