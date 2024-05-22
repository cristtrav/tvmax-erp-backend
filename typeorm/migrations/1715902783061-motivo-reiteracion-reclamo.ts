import { MigrationInterface, QueryRunner } from "typeorm";

export class MotivoReiteracionReclamo1715902783061 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS reclamos.vw_reclamos`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo ADD COLUMN motivo_reiteracion character varying(60)`);
        await queryRunner.query(`ALTER TABLE reclamos.reclamo ALTER COLUMN motivo_postergacion TYPE character varying(60) COLLATE pg_catalog."default"`);
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
            reclamo.observacion,
            reclamo.telefono,
            reclamo.motivo_reiteracion AS motivoreiteracion,
            reclamo.motivo_postergacion AS motivopostergacion,
            ( SELECT count(*) AS count
                   FROM reclamos.reiteracion
                  WHERE reiteracion.idreclamo = reclamo.id AND reiteracion.eliminado = false) AS nroreiteraciones
           FROM reclamos.reclamo
             JOIN suscripcion ON reclamo.idsuscripcion = suscripcion.id
             JOIN domicilio ON suscripcion.iddomicilio = domicilio.id
             JOIN barrio ON domicilio.idbarrio = barrio.id
             JOIN cliente ON suscripcion.idcliente = cliente.id
             JOIN servicio ON suscripcion.idservicio = servicio.id
             JOIN usuario uregistro ON uregistro.id = reclamo.idusuario_registro
             LEFT JOIN usuario uresponsable ON uresponsable.id = reclamo.idusuario_responsable;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS reclamos.vw_reclamos`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo DROP COLUMN IF EXISTS motivo_reiteracion;`);
        await queryRunner.query(`ALTER TABLE reclamos.reclamo ALTER COLUMN motivo_postergacion TYPE character varying(45) COLLATE pg_catalog."default"`);
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
            reclamo.observacion,
            reclamo.telefono,
            reclamo.motivo_postergacion AS motivopostergacion,
            ( SELECT count(*) AS count
                   FROM reclamos.reiteracion
                  WHERE reiteracion.idreclamo = reclamo.id AND reiteracion.eliminado = false) AS nroreiteraciones
           FROM reclamos.reclamo
             JOIN suscripcion ON reclamo.idsuscripcion = suscripcion.id
             JOIN domicilio ON suscripcion.iddomicilio = domicilio.id
             JOIN barrio ON domicilio.idbarrio = barrio.id
             JOIN cliente ON suscripcion.idcliente = cliente.id
             JOIN servicio ON suscripcion.idservicio = servicio.id
             JOIN usuario uregistro ON uregistro.id = reclamo.idusuario_registro
             LEFT JOIN usuario uresponsable ON uresponsable.id = reclamo.idusuario_responsable;`
        );
    }

}
