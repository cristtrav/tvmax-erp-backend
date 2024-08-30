import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisoGenerarCuotasMes1725036808799 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO public.funcionalidad (id, idmodulo, nombre, descripcion, eliminado)
            VALUES (226, 12, 'Generar Cuotas Mes', 'Permige generar cuotas para todas las suscripciones activas para un mes determinado', false)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 226`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 226`);
    }

}
