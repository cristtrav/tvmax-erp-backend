import { query } from "express";
import { MigrationInterface, QueryRunner } from "typeorm";

export class ServicioSuscripcionOpcional1734552311734 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_servicios;`);
        await queryRunner.query(
            `ALTER TABLE IF EXISTS public.servicio ADD COLUMN facturar_sin_suscripcion boolean NOT NULL DEFAULT false;`
        );
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_servicios AS
            SELECT servicio.id,
                servicio.descripcion,
                servicio.precio,
                servicio.suscribible,
                servicio.eliminado,
                servicio.idgrupo,
                servicio.porcentaje_iva AS porcentajeiva,
                servicio.facturar_sin_suscripcion AS facturarsinsuscripcion,
                grupo.descripcion AS grupo
            FROM servicio
                JOIN grupo ON servicio.idgrupo = grupo.id;`
        );
        await queryRunner.query(`ALTER TABLE IF EXISTS public.detalle_venta ALTER COLUMN idsuscripcion DROP NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_servicios;`);
        await queryRunner.query(
            `ALTER TABLE IF EXISTS public.servicio DROP COLUMN IF EXISTS facturar_sin_suscripcion;`
        );
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_servicios AS
            SELECT servicio.id,
                servicio.descripcion,
                servicio.precio,
                servicio.suscribible,
                servicio.eliminado,
                servicio.idgrupo,
                servicio.porcentaje_iva AS porcentajeiva,
                grupo.descripcion AS grupo
            FROM servicio
                JOIN grupo ON servicio.idgrupo = grupo.id;`
        );
        await queryRunner.query(`ALTER TABLE IF EXISTS public.detalle_venta ALTER COLUMN idsuscripcion SET NOT NULL;`);
    }

}
