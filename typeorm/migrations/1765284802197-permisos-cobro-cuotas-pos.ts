import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisosCobroCuotasPos1765284802197 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.funcionalidad (id, descripcion, idmodulo, nombre, eliminado)
            VALUES(1181, 'Permite agregar cuotas en la factura', 40, 'Cobro de cuotas', false);`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad IN (1181);`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id IN (1181);`);
    }

}
