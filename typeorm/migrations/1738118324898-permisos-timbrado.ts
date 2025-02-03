import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisosTimbrado1738118324898 implements MigrationInterface {

    private readonly ID_FUNCIONALIDADES = [1360, 1361, 1362, 1363, 1364];

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.modulo(id, descripcion, eliminado)
            VALUES(44, 'Timbrados', false);`
        );
        await queryRunner.query(
            `INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado)
            VALUES
                (1360, 44, 'Acceso al módulo', false),
                (1361, 44, 'Consultar', false),
                (1362, 44, 'Registrar', false),
                (1363, 44, 'Editar', false),
                (1364, 44, 'Eliminar', false);`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad IN (${this.ID_FUNCIONALIDADES.join(',')});`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE idmodulo = 44;`);
        await queryRunner.query(`DELETE FROM public.modulo WHERE id = 44;`);
    }

}
