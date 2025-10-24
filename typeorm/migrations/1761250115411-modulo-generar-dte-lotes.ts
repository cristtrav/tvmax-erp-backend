import { MigrationInterface, QueryRunner } from "typeorm";

export class ModuloGenerarDteLotes1761250115411 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO public.modulo(id, descripcion, eliminado)
            VALUES(46, 'Generar DTE en lotes', false);
        `);
        await queryRunner.query(`
            INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado)
            VALUES(1460, 46, 'Acceso al Módulo', false);
        `)
        await queryRunner.query(`
            INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado)
            VALUES(1461, 46, 'Generar Facturas', false);
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad IN (1460, 1461);`)
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id IN (1460, 1461);`)
        await queryRunner.query(`DELETE FROM public.modulo WHERE id = 46;`)
    }

}
