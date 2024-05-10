import { MigrationInterface, QueryRunner } from "typeorm";

export class PermisosAsignacionesReclamos1713891760618 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS reclamos.vw_reclamos`);
        await queryRunner.query(
            `CREATE OR REPLACE VIEW reclamos.vw_reclamos AS
            SELECT
                reclamo.id,
                reclamo.fecha,
                reclamo.fecha_hora_cambio_estado AS fechahoracambioestado,
                reclamo.observacion_estado AS observacionestado,
                reclamo.idusuario_registro AS idusuarioregistro,
                TRIM(BOTH FROM concat(uregistro.nombres, ' ', uregistro.apellidos)) AS usuarioregistro,
                reclamo.idusuario_responsable AS idusuarioresponsable,
                TRIM(BOTH FROM concat(uresponsable.nombres, ' ', uresponsable.apellidos)) AS usuarioresponsable,
                reclamo.idsuscripcion,
                suscripcion.iddomicilio,
                domicilio.direccion,
                domicilio.ubicacion[0] AS latitud,
                domicilio.ubicacion[1] AS longitud,
                domicilio.idbarrio,
                barrio.descripcion AS barrio,
                domicilio.observacion AS obsdomicilio,
                servicio.id AS idservicio,
                servicio.descripcion AS servicio,
                suscripcion.monto,
                suscripcion.observacion AS obssuscripcion,
                cliente.id AS idcliente,
                cliente.razon_social AS cliente,
                reclamo.estado,
                reclamo.eliminado,
                reclamo.observacion
            FROM reclamos.reclamo
                JOIN public.suscripcion ON reclamo.idsuscripcion = suscripcion.id
                JOIN public.domicilio ON suscripcion.iddomicilio = domicilio.id
                JOIN public.barrio ON domicilio.idbarrio = barrio.id
                JOIN public.cliente ON suscripcion.idcliente = cliente.id
                JOIN public.servicio ON suscripcion.idservicio = servicio.id
                JOIN public.usuario uregistro ON uregistro.id = reclamo.idusuario_registro
                LEFT JOIN public.usuario uresponsable ON uresponsable.id = reclamo.idusuario_responsable`);
        await queryRunner.query(`INSERT INTO public.modulo(id, descripcion, eliminado) VALUES(33, 'Asignacion de Reclamos', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (880, 'Acceso al Módulo', 33, false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (881, 'Acceso a Detalles', 33, false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (882, 'Tomar/liberar reclamo', 33, false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (883, 'Cambiar estado', 33, false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (884, 'Acceso al Formulario de Finalizar', 33, false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (885, 'Finalizar Reclamo', 33, false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (886, 'Editar Finalizacion de Reclamo', 33, false)`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.material_utilizado ADD COLUMN descripcion character varying(80)`);
        await queryRunner.query(
            `ALTER TABLE IF EXISTS reclamos.material_utilizado
            ADD CONSTRAINT material_utilizado_idmaterial_fkey FOREIGN KEY (idmaterial)
            REFERENCES depositos.material (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID`
        );
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.material_utilizado ALTER COLUMN id RESTART SET START 100`);
        await queryRunner.query(`INSERT INTO public.tabla_auditoria(id, descripcion) VALUES(31, 'Material Utilizado')`);
        await queryRunner.query(
            `CREATE VIEW reclamos.vw_materiales_utilizados AS
            SELECT
                material_utilizado.id,
                material_utilizado.idreclamo,
                material_utilizado.cantidad,
                material_utilizado.idmaterial,
                material_utilizado.descripcion,
                material.unidad_medida AS unidadmedida,
                material_utilizado.eliminado
            FROM reclamos.material_utilizado
            JOIN depositos.material ON material.id = material_utilizado.idmaterial`
        );
        await queryRunner.query(`UPDATE public.rol SET descripcion = 'Atención de reclamos (Técnico)' WHERE id = 9`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo ADD COLUMN observacion character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS reclamos.vw_reclamos`);
        await queryRunner.query(
            `CREATE OR REPLACE VIEW reclamos.vw_reclamos AS
                SELECT reclamo.id,
                    reclamo.fecha,
                    reclamo.fecha_hora_cambio_estado AS fechahoracambioestado,
                    reclamo.observacion_estado AS observacionestado,
                    reclamo.idusuario_registro AS idusuarioregistro,
                    TRIM(BOTH FROM concat(uregistro.nombres, ' ', uregistro.apellidos)) AS usuarioregistro,
                    reclamo.idusuario_responsable AS idusuarioresponsable,
                    TRIM(BOTH FROM concat(uresponsable.nombres, ' ', uresponsable.apellidos)) AS usuarioresponsable,
                    reclamo.idsuscripcion,
                    servicio.id AS idservicio,
                    servicio.descripcion AS servicio,
                    suscripcion.monto,
                    cliente.id AS idcliente,
                    cliente.razon_social AS cliente,
                    reclamo.estado,
                    reclamo.eliminado
                FROM reclamos.reclamo
                    JOIN suscripcion ON reclamo.idsuscripcion = suscripcion.id
                    JOIN cliente ON suscripcion.idcliente = cliente.id
                    JOIN servicio ON suscripcion.idservicio = servicio.id
                    JOIN usuario uregistro ON uregistro.id = reclamo.idusuario_registro
                    LEFT JOIN usuario uresponsable ON uresponsable.id = reclamo.idusuario_responsable;`
        );
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad >= 880 AND idfuncionalidad <= 886`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id >= 880 AND id <= 886`);
        await queryRunner.query(`DELETE FROM public.modulo WHERE id = 33`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.material_utilizado DROP COLUMN IF EXISTS descripcion`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.material_utilizado DROP CONSTRAINT IF EXISTS material_utilizado_idmaterial_fkey`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.material_utilizado ALTER COLUMN id RESTART SET START 10`);
        await queryRunner.query(`DELETE FROM public.evento_auditoria WHERE idtabla = 31`);
        await queryRunner.query(`DELETE FROM public.tabla_auditoria WHERE id = 31`);
        await queryRunner.query(`DROP VIEW IF EXISTS reclamos.vw_materiales_utilizados`);
        await queryRunner.query(`UPDATE public.rol SET descripcion = 'Proceso de Reclamos' WHERE id = 9`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo DROP COLUMN IF EXISTS observacion`);
    }

}
