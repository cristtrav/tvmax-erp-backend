import { MigrationInterface, QueryRunner } from "typeorm";

export class NumeracionCuotas1740341391604 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_cuotas;`)
        await queryRunner.query(
            `CREATE TABLE public.cuota_grupo
            (
                codigo character varying(10) NOT NULL,
                idsuscripcion integer NOT NULL,
                idservicio integer NOT NULL,
                total_cuotas integer NOT NULL DEFAULT 0,
                activo boolean NOT NULL DEFAULT true,
                CONSTRAINT pk_cuota_grupo PRIMARY KEY (codigo, idsuscripcion, idservicio),
                CONSTRAINT fk_cuota_grupo_suscripcion FOREIGN KEY (idsuscripcion)
                    REFERENCES public.suscripcion (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_cuota_grupo_servicio FOREIGN KEY (idservicio)
                    REFERENCES public.servicio (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            );`
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS public.cuota
                ADD COLUMN codigo_grupo character varying(10);
            ALTER TABLE IF EXISTS public.cuota
                ADD CONSTRAINT fk_cuota_cuota_grupo FOREIGN KEY (idsuscripcion, idservicio, codigo_grupo)
                REFERENCES public.cuota_grupo (idsuscripcion, idservicio, codigo) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
                NOT VALID;`
        );
        /*await queryRunner.query(
            `CREATE TABLE public.cuota_grupo_detalle
            (
                codigo_grupo character varying(10) NOT NULL,
                idsuscripcion integer NOT NULL,
                idservicio integer NOT NULL,
                idcuota integer NOT NULL,
                CONSTRAINT pk_cuota_grupo_detalle PRIMARY KEY (codigo_grupo, idsuscripcion, idservicio, idcuota),
                CONSTRAINT fk_cuota_grupo_detalle_cuota_grupo FOREIGN KEY (codigo_grupo, idsuscripcion, idservicio)
                    REFERENCES public.cuota_grupo (codigo, idsuscripcion, idservicio) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_cuota_grupo_detalle_cuota FOREIGN KEY (idcuota)
                    REFERENCES public.cuota (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_cuota_grupo_detalle_servicio FOREIGN KEY (idservicio)
                    REFERENCES public.servicio (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            );`
        );*/
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_cuotas_grupos AS
            SELECT
                cuota_grupo.codigo,
                cuota_grupo.idsuscripcion,
                cuota_grupo.idservicio,
                cuota_grupo.total_cuotas AS totalcuotas,
                cuota_grupo.activo
            FROM public.cuota_grupo;`
        );
        await queryRunner.query(
            `INSERT INTO public.tabla_auditoria(id, descripcion)
            VALUES(42, 'Grupos de Cuotas');`
        );
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_cuotas AS
            SELECT
                cuota.id,
                cuota.observacion,
                cuota.fecha_vencimiento AS fechavencimiento,
                cuota.monto,
                cuota.nro_cuota AS nrocuota,
                cuota_grupo.total_cuotas AS totalcuotas,
                cuota_grupo.codigo AS codigogrupo,
                cuota.idsuscripcion,
                cuota.idservicio,
                servicio.descripcion AS servicio,
                servicio.porcentaje_iva AS porcentajeiva,
                cuota.pagado,
                cuota.eliminado
            FROM public.cuota
            JOIN public.servicio ON cuota.idservicio = servicio.id
            LEFT JOIN public.cuota_grupo ON
                cuota.codigo_grupo = cuota_grupo.codigo AND
                cuota.idservicio = cuota_grupo.idservicio AND
                cuota.idsuscripcion = cuota_grupo.idsuscripcion;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_cuotas;`)
        await queryRunner.query(`DELETE FROM public.evento_auditoria WHERE idtabla = 42;`);
        await queryRunner.query(`DELETE FROM public.tabla_auditoria WHERE id = 42;`);
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_cuotas_grupos;`);
        //await queryRunner.query(`DROP TABLE IF EXISTS public.cuota_grupo_detalle;`);
        await queryRunner.query(
            `ALTER TABLE IF EXISTS public.cuota DROP COLUMN IF EXISTS codigo_grupo;
            ALTER TABLE IF EXISTS public.cuota DROP CONSTRAINT IF EXISTS fk_cuota_cuota_grupo;`
        );
        await queryRunner.query(`DROP TABLE IF EXISTS public.cuota_grupo;`);
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_cuotas AS
            SELECT 
                cuota.id,
                cuota.observacion,
                cuota.fecha_vencimiento AS fechavencimiento,
                cuota.monto,
                cuota.nro_cuota AS nrocuota,
                cuota.idsuscripcion,
                cuota.idservicio,
                servicio.descripcion AS servicio,
                servicio.porcentaje_iva AS porcentajeiva,
                cuota.pagado,
                cuota.eliminado
            FROM public.cuota
            JOIN servicio ON cuota.idservicio = servicio.id;`
        );
    }

}
