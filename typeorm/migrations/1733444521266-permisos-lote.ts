import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisosLote1733444521266 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.modulo(id, descripcion, eliminado)VALUES(41, 'Lotes Facturas Electrónicas', false)`
        );
        await queryRunner.query(
            `INSERT INTO
                public.funcionalidad(id, idmodulo, nombre, eliminado)
            VALUES
                (1220, 41, 'Acceso al módulo', false),
                (1221, 41, 'Consultar', false),
                (1222, 41, 'Generar', false),
                (1223, 41, 'Enviar a SIFEN', false),
                (1224, 41, 'Consultar a SIFEN', false);`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const idpermisos = [1220, 1221, 1222, 1223, 1224];
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad IN (${idpermisos.join(',')})`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id IN (${idpermisos.join(',')})`);
        await queryRunner.query(`DELETE FROM public.modulo WHERE id = 41`);
    }

}
