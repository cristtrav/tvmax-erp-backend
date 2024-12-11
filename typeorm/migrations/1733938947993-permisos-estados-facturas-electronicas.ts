import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisosEstadosFacturasElectronicas1733938947993 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(
            `INSERT INTO public.modulo(id, descripcion, eliminado)
            VALUES(42, 'Estados de facturas electrónicas', false)`
        );
        queryRunner.query(
            `INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado)
            VALUES(1260, 42, 'Consultar', false)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 1260`);
        queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 1260`);
        queryRunner.query(`DELETE FROM public.modulo WHERE id = 42`);
    }

}
