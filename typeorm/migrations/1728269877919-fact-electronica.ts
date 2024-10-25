import { MigrationInterface, QueryRunner } from "typeorm";

export class FactElectronica1728269877919 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);

        await queryRunner.query(`ALTER TABLE public.timbrado ALTER COLUMN cod_establecimiento TYPE smallint`);
        await queryRunner.query(`ALTER TABLE public.timbrado ALTER COLUMN cod_punto_emision TYPE smallint`);
        
        await queryRunner.query(
            `ALTER TABLE IF EXISTS public.timbrado
                ADD COLUMN electronico boolean NOT NULL DEFAULT false`
        );
        
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS facturacion`);
        
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS facturacion.establecimiento
            (
                id smallint NOT NULL,
                denominacion character varying(60) NOT NULL,
                direccion character varying(150) NOT NULL,
                nro_casa smallint NOT NULL,
                cod_departamento integer NOT NULL,
                departamento character varying(60) NOT NULL,
                cod_distrito integer NOT NULL,
                distrito character varying(80) NOT NULL,
				cod_ciudad integer NOT NULL,
                ciudad character varying(80) NOT NULL,
                telefono character varying(20) NOT NULL,
                email character varying(100) NOT NULL,
                PRIMARY KEY (id)
            );

            COMMENT ON COLUMN facturacion.establecimiento.cod_departamento
                IS 'Código según SIFEN';

            COMMENT ON COLUMN facturacion.establecimiento.departamento
                IS 'Descripción según Sifen';

            COMMENT ON COLUMN facturacion.establecimiento.cod_ciudad
                IS 'Código segun Sifen';

            COMMENT ON COLUMN facturacion.establecimiento.ciudad
                IS 'Descripción según Sifen';`
        );
        await queryRunner.query(
            `INSERT INTO facturacion.establecimiento(
                id, denominacion, direccion, nro_casa, cod_departamento, departamento, cod_distrito, distrito, cod_ciudad, ciudad, telefono, email
            ) VALUES (
                1, 'TVMAX CABLE SA', 'CARLOS A. LOPEZ', 425, 6, 'CAAGUAZU', 61, 'CNEL. OVIEDO', 2937, 'CNEL. OVIEDO', '0521200240', 'facturacion@sistema.tvmaxcable.com.py'
            )`
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS public.timbrado
            ADD CONSTRAINT fk_timbrado_establecimiento FOREIGN KEY (cod_establecimiento)
            REFERENCES facturacion.establecimiento (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID;`
        );
        await queryRunner.query(
            `CREATE TABLE facturacion.estado_documento_sifen
            (
                id smallint NOT NULL,
                descripcion character varying(80) NOT NULL,
                PRIMARY KEY (id)
            );`
        );
        await queryRunner.query(
            `INSERT INTO facturacion.estado_documento_sifen(id, descripcion)VALUES(1, 'Aprobado');
            INSERT INTO facturacion.estado_documento_sifen(id, descripcion)VALUES(2, 'Aprobado con observación');
            INSERT INTO facturacion.estado_documento_sifen(id, descripcion)VALUES(3, 'Rechazado');
            INSERT INTO facturacion.estado_documento_sifen(id, descripcion)VALUES(4, 'Cancelado');
            INSERT INTO facturacion.estado_documento_sifen(id, descripcion)VALUES(5, 'Invalidado');
            INSERT INTO facturacion.estado_documento_sifen(id, descripcion)VALUES(30, 'No enviado');
            INSERT INTO facturacion.estado_documento_sifen(id, descripcion)VALUES(31, 'Anulado - No enviado');`
        );
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS facturacion.factura_electronica
            (
                idventa integer NOT NULL,
                documento_electronico xml NOT NULL,
                firmado boolean NOT NULL DEFAULT false,
                version smallint NOT NULL,
                idestado_documento_sifen integer NOT NULL,
                fecha_cambio_estado timestamp with time zone NOT NULL,
                observacion text,
                PRIMARY KEY (idventa),
                CONSTRAINT fk_factura_electronica_venta FOREIGN KEY (idventa)
                    REFERENCES public.venta (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_factura_electronica_estado_documento_sifen FOREIGN KEY (idestado_documento_sifen)
                    REFERENCES facturacion.estado_documento_sifen (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            );
            COMMENT ON COLUMN facturacion.factura_electronica.firmado
                IS 'Indica si el documento electronico fue firmado electronicamente';`
        );
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS facturacion.dato_contribuyente
            (
                clave character varying(50) NOT NULL,
                valor character varying(200) NOT NULL,
                PRIMARY KEY (clave)
            );`
        );
        await queryRunner.query(`INSERT INTO facturacion.dato_contribuyente(clave, valor) VALUES ('ruc', '80029009-7')`);
        await queryRunner.query(`INSERT INTO facturacion.dato_contribuyente(clave, valor) VALUES ('razon-social', 'TV MAX CABLE SA')`);

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS facturacion.actividad_economica
            (
                id integer NOT NULL,
                descripcion character varying(150) NOT NULL,
                PRIMARY KEY (id)
            );

            COMMENT ON COLUMN facturacion.actividad_economica.id
                IS 'Codigo según tributación';`
        )
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS facturacion.codigo_seguridad_contribuyente
            (
                id integer NOT NULL,
                codigo_seguridad character varying(200) NOT NULL,
                activo boolean NOT NULL DEFAULT true,
                PRIMARY KEY (id)
            );

            COMMENT ON TABLE facturacion.codigo_seguridad_contribuyente
                IS 'Conocido como CSC, para generar códigos QR. Debe generarse en Marangatu';`
        );
        await queryRunner.query(`INSERT INTO facturacion.actividad_economica(id, descripcion) VALUES(1254, 'Desarrollo de Software')`);
        await this.createViewsUp(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);

        await queryRunner.query(`ALTER TABLE IF EXISTS public.timbrado DROP CONSTRAINT IF EXISTS fk_timbrado_establecimiento`);
        await queryRunner.query(`ALTER TABLE public.timbrado ALTER COLUMN cod_establecimiento TYPE numeric`);
        await queryRunner.query(`ALTER TABLE public.timbrado ALTER COLUMN cod_punto_emision TYPE numeric`);

        await queryRunner.query(`ALTER TABLE IF EXISTS public.timbrado DROP COLUMN IF EXISTS electronico`);
        
        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.factura_electronica`);
        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.establecimiento`);
        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.dato_contribuyente`);
        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.actividad_economica`);
        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.codigo_seguridad_contribuyente`);
        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.estado_documento_sifen`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS facturacion`);

        await this.createViewsDown(queryRunner);
    }

    private async dropViews(queryRunner: QueryRunner){
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_timbrados`);
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_cobro_cuotas`);
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_cobro_detalle_venta`);
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_ventas`);
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_ventas_tributacion_exp`);
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_ventas`);
    }

    private async createViewsUp(queryRunner: QueryRunner){
        await this.createVwTimbradosUp(queryRunner);
        await this.createVwCobroCuotas(queryRunner);
        await this.createVwCobroDetalleVenta(queryRunner);
        await this.createVwVentasTributacionExp(queryRunner);
        await this.createVentasVwUp(queryRunner);
    }

    private async createViewsDown(queryRunner: QueryRunner){
        await this.createVwTimbradosDown(queryRunner);
        await this.createVwCobroCuotas(queryRunner);
        await this.createVwCobroDetalleVenta(queryRunner);
        await this.createVwVentasTributacionExp(queryRunner);
        await this.createVentasVwDown(queryRunner);
    }

    private async createVwTimbradosDown(queryRunner: QueryRunner): Promise<void>{
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_timbrados AS
            SELECT id,
                cod_establecimiento AS codestablecimiento,
                cod_punto_emision AS codpuntoemision,
                concat(to_char(cod_establecimiento, 'fm000'::text), '-', to_char(cod_punto_emision, 'fm000'::text)) AS prefijo,
                nro_inicio AS nroinicio,
                nro_fin AS nrofin,
                to_char(fecha_inicio_vigencia::timestamp with time zone, 'YYYY-MM-DD'::text) AS fechainicio,
                to_char(fecha_vencimiento::timestamp with time zone, 'YYYY-MM-DD'::text) AS fechavencimiento,
                nro_timbrado AS nrotimbrado,
                ultimo_nro_usado AS ultimonrousado,
                activo,
                idformato_factura AS idformatofactura,
                eliminado
            FROM timbrado;`
        );
    }

    private async createVwTimbradosUp(queryRunner: QueryRunner): Promise<void>{
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_timbrados AS
            SELECT id,
                cod_establecimiento AS codestablecimiento,
                cod_punto_emision AS codpuntoemision,
                concat(to_char(cod_establecimiento, 'fm000'::text), '-', to_char(cod_punto_emision, 'fm000'::text)) AS prefijo,
                nro_inicio AS nroinicio,
                nro_fin AS nrofin,
                to_char(fecha_inicio_vigencia::timestamp with time zone, 'YYYY-MM-DD'::text) AS fechainicio,
                to_char(fecha_vencimiento::timestamp with time zone, 'YYYY-MM-DD'::text) AS fechavencimiento,
                nro_timbrado AS nrotimbrado,
                ultimo_nro_usado AS ultimonrousado,
                activo,
                idformato_factura AS idformatofactura,
                electronico,
                eliminado
            FROM timbrado;`
        );
    }

    private async createVwCobroCuotas(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_cobro_cuotas AS
            SELECT cuota.id AS idcuota,
                cobro.fecha AS fechacobro,
                    CASE
                        WHEN venta.idtimbrado IS NOT NULL THEN concat(to_char(timbrado.cod_establecimiento, 'fm000'::text), '-', to_char(timbrado.cod_punto_emision, 'fm000'::text), '-', to_char(venta.nro_factura, 'fm0000000'::text))
                        ELSE NULL::text
                    END AS facturacobro,
                cobro.comision_para AS idcobrador,
                    CASE
                        WHEN cobro.comision_para IS NOT NULL THEN btrim(concat(cobrador.nombres, ' ', cobrador.apellidos))
                        ELSE NULL::text
                    END AS cobrador,
                usuario.id AS idusuario,
                    CASE
                        WHEN cobro.cobrado_por IS NOT NULL THEN btrim(concat(usuario.nombres, ' ', usuario.apellidos))
                        ELSE NULL::text
                    END AS usuario
            FROM cuota
                JOIN detalle_venta ON detalle_venta.idcuota = cuota.id AND detalle_venta.eliminado = false
                JOIN venta ON detalle_venta.idventa = venta.id AND venta.eliminado = false AND venta.anulado = false AND venta.pagado = true
                JOIN cobro ON cobro.idventa = venta.id AND cobro.eliminado = false AND cobro.anulado = false
                JOIN usuario cobrador ON cobro.comision_para = cobrador.id
                JOIN usuario usuario ON cobro.cobrado_por = usuario.id
                LEFT JOIN timbrado ON venta.idtimbrado = timbrado.id;`
        );
    }

    private async createVwCobroDetalleVenta(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_cobro_detalle_venta AS
            SELECT venta.id AS idventa,
                detalle_venta.id AS iddetalleventa,
                detalle_venta.cantidad * detalle_venta.monto AS monto,
                detalle_venta.idservicio,
                detalle_venta.idsuscripcion,
                detalle_venta.descripcion,
                servicio.descripcion AS servicio,
                servicio.idgrupo,
                grupo.descripcion AS grupo,
                cuota.fecha_vencimiento AS fechavencimiento,
                detalle_venta.idcuota,
                cliente.razon_social AS cliente,
                cliente.ci,
                cliente.dv_ruc AS dvruc,
                venta.idcliente,
                venta.fecha_factura AS fechafactura,
                venta.pagado,
                venta.anulado,
                    CASE
                        WHEN venta.nro_factura IS NOT NULL THEN concat(to_char(timbrado.cod_establecimiento, 'fm000'::text), '-', to_char(timbrado.cod_punto_emision, 'fm000'::text), '-', to_char(venta.nro_factura, 'fm0000000'::text))
                        ELSE NULL::text
                    END AS facturacobro,
                cobro.fecha AS fechacobro,
                cobrador.id AS idcobradorcomision,
                btrim(concat(cobrador.nombres, ' ', cobrador.apellidos)) AS cobrador,
                usuario.id AS idusuarioregistrocobro,
                btrim(concat(usuario.nombres, ' ', usuario.apellidos)) AS usuarioregistrocobro,
                detalle_venta.eliminado
            FROM detalle_venta
                JOIN venta ON detalle_venta.idventa = venta.id AND venta.eliminado = false AND venta.anulado = false AND venta.pagado = true
                JOIN servicio ON detalle_venta.idservicio = servicio.id
                JOIN grupo ON servicio.idgrupo = grupo.id
                JOIN cliente ON venta.idcliente = cliente.id
                LEFT JOIN timbrado ON venta.idtimbrado = timbrado.id
                LEFT JOIN cuota ON detalle_venta.idcuota = cuota.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.eliminado = false AND cobro.anulado = false
                LEFT JOIN usuario cobrador ON cobro.comision_para = cobrador.id
                LEFT JOIN usuario usuario ON cobro.cobrado_por = usuario.id;`
        );
    }

    /*private async createVwVentas(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas AS
            SELECT venta.id,
                venta.fecha_factura AS fechafactura,
                venta.total_gravado_iva10 AS totalgravadoiva10,
                venta.total_gravado_iva5 AS totalgravadoiva5,
                venta.total_exento_iva AS totalexentoiva,
                venta.total_iva10 AS totaliva10,
                venta.total_iva5 AS totaliva5,
                venta.total,
                venta.pagado,
                venta.anulado,
                venta.idcliente,
                cliente.razon_social AS cliente,
                cliente.ci,
                cliente.dv_ruc AS dvruc,
                venta.nro_factura AS nrofactura,
                venta.idtimbrado,
                timbrado.nro_timbrado AS timbrado,
                timbrado.fecha_vencimiento AS vencimientotimbrado,
                timbrado.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtimbrado IS NOT NULL THEN concat(to_char(timbrado.cod_establecimiento, 'fm000'::text), '-', to_char(timbrado.cod_punto_emision, 'fm000'::text))
                        ELSE NULL::text
                    END AS prefijofactura,
                cobro.comision_para AS idcobradorcomision,
                btrim(concat(cobrador.nombres, ' ', cobrador.apellidos)) AS cobrador,
                cobro.fecha AS fechacobro,
                venta.idusuario_registro_factura AS idusuarioregistrofactura,
                btrim(concat(usuariofactura.nombres, ' ', usuariofactura.apellidos)) AS usuarioregistrofactura,
                cobro.cobrado_por AS idusuarioregistrocobro,
                btrim(concat(usuariocobro.nombres, ' ', usuariocobro.apellidos)) AS usuarioregistrocobro,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN timbrado ON timbrado.id = venta.idtimbrado
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id;`
        );
    }*/

    private async createVwVentasTributacionExp(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas_tributacion_exp AS
            SELECT 1 AS tiporegistro,
                    CASE
                        WHEN cliente.dv_ruc IS NULL THEN 12
                        ELSE 11
                    END AS tipoidentificacion,
                cliente.ci,
                to_char(venta.fecha_factura::timestamp with time zone, 'DD/MM/YYYY'::text) AS fecha,
                    CASE
                        WHEN cliente.nombres IS NULL AND cliente.apellidos IS NULL THEN cliente.razon_social
                        ELSE cliente.razon_social
                    END AS razonsocial,
                109 AS tipocomprobante,
                timbrado.nro_timbrado AS nrotimbrado,
                concat(to_char(timbrado.cod_establecimiento, 'fm000'::text), '-', to_char(timbrado.cod_punto_emision, 'fm000'::text), '-', to_char(venta.nro_factura, 'fm0000000'::text)) AS nrocomprobante,
                venta.total_gravado_iva10 AS gravadoiva10,
                venta.total_gravado_iva5 AS gravadoiva5,
                venta.total_exento_iva AS exento,
                venta.total,
                1 AS condicion,
                'N'::text AS monedaextranjera,
                'S'::text AS imputaiva,
                'S'::text AS imputaire,
                'N'::text AS imputairp
            FROM venta
                JOIN cliente ON venta.idcliente = cliente.id
                JOIN timbrado ON venta.idtimbrado = timbrado.id
            WHERE venta.eliminado = false AND venta.anulado = false
            ORDER BY venta.id, venta.fecha_factura;`
        );
    }

    private async createVentasVwUp(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas AS
            SELECT venta.id,
                venta.fecha_factura AS fechafactura,
                venta.total_gravado_iva10 AS totalgravadoiva10,
                venta.total_gravado_iva5 AS totalgravadoiva5,
                venta.total_exento_iva AS totalexentoiva,
                venta.total_iva10 AS totaliva10,
                venta.total_iva5 AS totaliva5,
                venta.total,
                venta.pagado,
                venta.anulado,
                venta.idcliente,
                cliente.razon_social AS cliente,
                cliente.ci,
                cliente.dv_ruc AS dvruc,
                venta.nro_factura AS nrofactura,
                venta.idtimbrado,
                timbrado.nro_timbrado AS timbrado,
                timbrado.fecha_vencimiento AS vencimientotimbrado,
                timbrado.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtimbrado IS NOT NULL THEN concat(to_char(timbrado.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(timbrado.cod_punto_emision::double precision, 'fm000'::text))
                        ELSE NULL::text
                    END AS prefijofactura,
                timbrado.electronico AS facturaelectronica,
                cobro.comision_para AS idcobradorcomision,
                btrim(concat(cobrador.nombres, ' ', cobrador.apellidos)) AS cobrador,
                cobro.fecha AS fechacobro,
                venta.idusuario_registro_factura AS idusuarioregistrofactura,
                btrim(concat(usuariofactura.nombres, ' ', usuariofactura.apellidos)) AS usuarioregistrofactura,
                cobro.cobrado_por AS idusuarioregistrocobro,
                btrim(concat(usuariocobro.nombres, ' ', usuariocobro.apellidos)) AS usuarioregistrocobro,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN timbrado ON timbrado.id = venta.idtimbrado
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id;`
        );
    }

    private async createVentasVwDown(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas AS
            SELECT venta.id,
                venta.fecha_factura AS fechafactura,
                venta.total_gravado_iva10 AS totalgravadoiva10,
                venta.total_gravado_iva5 AS totalgravadoiva5,
                venta.total_exento_iva AS totalexentoiva,
                venta.total_iva10 AS totaliva10,
                venta.total_iva5 AS totaliva5,
                venta.total,
                venta.pagado,
                venta.anulado,
                venta.idcliente,
                cliente.razon_social AS cliente,
                cliente.ci,
                cliente.dv_ruc AS dvruc,
                venta.nro_factura AS nrofactura,
                venta.idtimbrado,
                timbrado.nro_timbrado AS timbrado,
                timbrado.fecha_vencimiento AS vencimientotimbrado,
                timbrado.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtimbrado IS NOT NULL THEN concat(to_char(timbrado.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(timbrado.cod_punto_emision::double precision, 'fm000'::text))
                        ELSE NULL::text
                    END AS prefijofactura,
                cobro.comision_para AS idcobradorcomision,
                btrim(concat(cobrador.nombres, ' ', cobrador.apellidos)) AS cobrador,
                cobro.fecha AS fechacobro,
                venta.idusuario_registro_factura AS idusuarioregistrofactura,
                btrim(concat(usuariofactura.nombres, ' ', usuariofactura.apellidos)) AS usuarioregistrofactura,
                cobro.cobrado_por AS idusuarioregistrocobro,
                btrim(concat(usuariocobro.nombres, ' ', usuariocobro.apellidos)) AS usuarioregistrocobro,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN timbrado ON timbrado.id = venta.idtimbrado
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id;`
        );
    }

}
