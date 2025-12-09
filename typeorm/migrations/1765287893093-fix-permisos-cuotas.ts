import { MigrationInterface, QueryRunner } from "typeorm";

export class FixPermisosCuotas1765287893093 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE public.funcionalidad SET descripcion = '"Permite exonerar o quitar exoneración de las cuotas"' WHERE id = 227;`)
        await queryRunner.query(
            `INSERT INTO public.funcionalidad (id, descripcion, idmodulo, nombre, eliminado)
            VALUES(381, 'Permite agregar cuotas en la factura', 20, 'Cobro de cuotas', false);`
        );
        await queryRunner.query(`UPDATE public.permiso SET idfuncionalidad = 381 WHERE idfuncionalidad = 1181;`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 1181;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE public.funcionalidad SET descripcion = '"Permige exonerar o quitar exoneración de las cuotas"' WHERE id = 227;`)
        await queryRunner.query(
            `INSERT INTO public.funcionalidad (id, descripcion, idmodulo, nombre, eliminado)
            VALUES(1181, 'Permite agregar cuotas en la factura', 40, 'Cobro de cuotas', false);`
        );
        await queryRunner.query(`UPDATE public.permiso SET idfuncionalidad = 1181 WHERE idfuncionalidad = 381;`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 381;`)
    }

}
