import { MigrationInterface, QueryRunner } from "typeorm";

export class EstadoAsignadoReclamo1716065746156 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON TYPE reclamos.estado_reclamo
            IS 'PEN=Pendiente, PRO=En proceso, POS=Postergado, FIN=Finalizado, OTR = Otro, ASI = Asignado'`
        );
        await queryRunner.query(`ALTER TYPE reclamos.estado_reclamo ADD VALUE 'ASI' AFTER 'OTR'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS reclamos.vw_reclamos`);
        await queryRunner.query(`DROP VIEW IF EXISTS reclamos.vw_eventos_cambios_estados`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo ADD COLUMN estado_copy character varying(5)`);
        await queryRunner.query(`CREATE TYPE reclamos.estado_reclamo_copy AS ENUM ('PEN', 'PRO', 'POS', 'FIN', 'OTR')`);
        await queryRunner.query(`COMMENT ON TYPE reclamos.estado_reclamo_copy IS 'PEN=Pendiente, PRO=En proceso, POS=Postergado, FIN=Finalizado, OTR = Otro'`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo ADD COLUMN estado_new reclamos.estado_reclamo_copy`);
        await queryRunner.query(`UPDATE reclamos.reclamo SET estado_copy = estado`);
        await queryRunner.query(`UPDATE reclamos.reclamo SET estado_new = estado_copy::reclamos.estado_reclamo_copy`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo DROP COLUMN IF EXISTS estado`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo RENAME estado_new TO estado`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.reclamo DROP COLUMN IF EXISTS estado_copy`);
        
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.evento_cambio_estado ADD COLUMN estado_copy character varying(5)`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.evento_cambio_estado ADD COLUMN estado_new reclamos.estado_reclamo_copy;`)
        
        await queryRunner.query(`UPDATE reclamos.evento_cambio_estado SET estado_copy = estado`);
        await queryRunner.query(`UPDATE reclamos.evento_cambio_estado SET estado_new = estado_copy::reclamos.estado_reclamo_copy`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.evento_cambio_estado DROP COLUMN IF EXISTS estado`);
        await queryRunner.query(`ALTER TABLE IF EXISTS reclamos.evento_cambio_estado RENAME estado_new TO estado`);
        
        await queryRunner.query(`DROP TYPE IF EXISTS reclamos.estado_reclamo`);
        await queryRunner.query(`ALTER TYPE reclamos.estado_reclamo_copy RENAME TO estado_reclamo`);

        await queryRunner.query(
            `CREATE OR REPLACE VIEW reclamos.vw_eventos_cambios_estados AS
            SELECT id,
                idreclamo,
                estado,
                fecha_hora AS fechahora,
                observacion
            FROM reclamos.evento_cambio_estado`
        );
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
                cliente.ci,
                reclamo.estado,
                reclamo.eliminado,
                reclamo.observacion,
                reclamo.telefono,
                reclamo.motivo_reiteracion AS motivoreiteracion,
                reclamo.motivo_postergacion AS motivopostergacion,
                ( SELECT count(*) AS count
                    FROM reclamos.reiteracion
                    WHERE reiteracion.idreclamo = reclamo.id AND reiteracion.eliminado = false) AS nroreiteraciones,
                reclamo.persona_recepcion_tecnico AS personarecepciontecnico
            FROM reclamos.reclamo
                JOIN suscripcion ON reclamo.idsuscripcion = suscripcion.id
                JOIN domicilio ON suscripcion.iddomicilio = domicilio.id
                JOIN barrio ON domicilio.idbarrio = barrio.id
                JOIN cliente ON suscripcion.idcliente = cliente.id
                JOIN servicio ON suscripcion.idservicio = servicio.id
                JOIN usuario uregistro ON uregistro.id = reclamo.idusuario_registro
                LEFT JOIN usuario uresponsable ON uresponsable.id = reclamo.idusuario_responsable`
        );
    }

}
