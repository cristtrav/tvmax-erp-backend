import { MigrationInterface, QueryRunner } from "typeorm";

export class TipoCliente1741659347589 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);
        await queryRunner.query(
            `CREATE TABLE public.cliente_tipo
            (
                id smallint NOT NULL,
                descripcion character varying(40) NOT NULL,
                PRIMARY KEY (id)
            );

            COMMENT ON TABLE public.cliente_tipo
                IS 'Tipo de cliente exigido el sistema de facturación electrónica. 1 = B2B, 2 = B2C, 3 = B2G';`
        );
        await queryRunner.query(
            `INSERT INTO public.cliente_tipo(id, descripcion)
            VALUES(1, 'Empresa'), (2, 'Particular'), (3, 'Entidad Estatal');`
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS public.cliente
                ADD COLUMN idtipo_cliente smallint NOT NULL DEFAULT 2;
            ALTER TABLE IF EXISTS public.cliente
                ADD CONSTRAINT fk_cliente_tipo FOREIGN KEY (idtipo_cliente)
                REFERENCES public.cliente_tipo (id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
                NOT VALID;`
        );
        await this.createViewsUp(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);
        await queryRunner.query(
            `ALTER TABLE IF EXISTS public.cliente DROP CONSTRAINT IF EXISTS fk_cliente_tipo;
            ALTER TABLE IF EXISTS public.cliente DROP COLUMN IF EXISTS idtipo_cliente;`
        );
        await queryRunner.query(`DROP TABLE IF EXISTS public.cliente_tipo;`);
        await this.createViewsDown(queryRunner);
    }

    private async dropViews(queryRunner: QueryRunner){
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_clientes;`);
    }

    private async createViewsUp(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_clientes AS
            SELECT cliente.id,
                cliente.nombres,
                cliente.apellidos,
                cliente.razon_social AS razonsocial,
                cliente.ci,
                cliente.dv_ruc AS dvruc,
                cliente.telefono1,
                cliente.telefono2,
                cliente.email,
                cliente.idcobrador,
                btrim(concat(usuario.nombres, ' ', usuario.apellidos)) AS cobrador,
                domicilio.id AS iddomicilio,
                domicilio.direccion,
                domicilio.observacion AS obsdomicilio,
                domicilio.idbarrio,
                domicilio.ubicacion[0] AS latitud,
                domicilio.ubicacion[1] AS longitud,
                barrio.descripcion AS barrio,
                distrito.id AS iddistrito,
                distrito.descripcion AS distrito,
                departamento.id AS iddepartamento,
                departamento.descripcion AS departamento,
                COALESCE(resumenconexiones.conectados, 0::bigint) AS cantconectados,
                COALESCE(resumenconexiones.desconectados, 0::bigint) AS cantdesconectados,
                cliente.excluido_sorteo AS excluidosorteo,
                cliente_tipo.id AS idtipocliente,
                cliente_tipo.descripcion AS tipocliente,
                cliente.eliminado
            FROM cliente
                JOIN usuario ON usuario.id = cliente.idcobrador
                JOIN public.cliente_tipo ON cliente.idtipo_cliente = cliente_tipo.id
                LEFT JOIN ( SELECT suscripcion.idcliente,
                        sum(
                            CASE
                                WHEN suscripcion.estado::text = 'C'::text OR suscripcion.estado::text = 'R'::text THEN 1
                                ELSE 0
                            END) AS conectados,
                        sum(
                            CASE suscripcion.estado
                                WHEN 'D'::text THEN 1
                                ELSE 0
                            END) AS desconectados
                    FROM suscripcion
                    WHERE suscripcion.eliminado = false
                    GROUP BY suscripcion.idcliente) resumenconexiones ON resumenconexiones.idcliente = cliente.id
                LEFT JOIN domicilio ON domicilio.idcliente = cliente.id AND domicilio.principal = true
                LEFT JOIN barrio ON barrio.id = domicilio.idbarrio
                LEFT JOIN distrito ON distrito.id::text = barrio.iddistrito::text
                LEFT JOIN departamento ON departamento.id::text = distrito.iddepartamento::text;`
        );

    }

    private async createViewsDown(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_clientes AS
             SELECT cliente.id,
                cliente.nombres,
                cliente.apellidos,
                cliente.razon_social AS razonsocial,
                cliente.ci,
                cliente.dv_ruc AS dvruc,
                cliente.telefono1,
                cliente.telefono2,
                cliente.email,
                cliente.idcobrador,
                btrim(concat(usuario.nombres, ' ', usuario.apellidos)) AS cobrador,
                domicilio.id AS iddomicilio,
                domicilio.direccion,
                domicilio.observacion AS obsdomicilio,
                domicilio.idbarrio,
                domicilio.ubicacion[0] AS latitud,
                domicilio.ubicacion[1] AS longitud,
                barrio.descripcion AS barrio,
                distrito.id AS iddistrito,
                distrito.descripcion AS distrito,
                departamento.id AS iddepartamento,
                departamento.descripcion AS departamento,
                COALESCE(resumenconexiones.conectados, 0::bigint) AS cantconectados,
                COALESCE(resumenconexiones.desconectados, 0::bigint) AS cantdesconectados,
                cliente.excluido_sorteo AS excluidosorteo,
                cliente.eliminado
            FROM cliente
                JOIN usuario ON usuario.id = cliente.idcobrador
                LEFT JOIN ( SELECT suscripcion.idcliente,
                        sum(
                            CASE
                                WHEN suscripcion.estado::text = 'C'::text OR suscripcion.estado::text = 'R'::text THEN 1
                                ELSE 0
                            END) AS conectados,
                        sum(
                            CASE suscripcion.estado
                                WHEN 'D'::text THEN 1
                                ELSE 0
                            END) AS desconectados
                    FROM suscripcion
                    WHERE suscripcion.eliminado = false
                    GROUP BY suscripcion.idcliente) resumenconexiones ON resumenconexiones.idcliente = cliente.id
                LEFT JOIN domicilio ON domicilio.idcliente = cliente.id AND domicilio.principal = true
                LEFT JOIN barrio ON barrio.id = domicilio.idbarrio
                LEFT JOIN distrito ON distrito.id::text = barrio.iddistrito::text
                LEFT JOIN departamento ON departamento.id::text = distrito.iddepartamento::text;`
        );
    }

}
