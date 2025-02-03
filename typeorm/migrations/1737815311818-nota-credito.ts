import { MigrationInterface, QueryRunner } from "typeorm";

export class NotaCredito1737815311818 implements MigrationInterface {

    private readonly idfuncionalidades: number[] = [1300, 1301, 1302, 1303, 1304, 1305];

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);
        await queryRunner.query(
            `INSERT INTO public.tabla_auditoria(id, descripcion)
            VALUES
                (40, 'Notas de crédito'),
                (41, 'Detalles de notas de crédito');`
        );
        await queryRunner.query(
            `CREATE TABLE facturacion.nota_credito
            (
                id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
                fecha_hora timestamp with time zone NOT NULL DEFAULT NOW(),
                nro_nota integer NOT NULL DEFAULT 0,
                anulado boolean NOT NULL DEFAULT false,
                idtalonario integer NOT NULL,
                idcliente integer NOT NULL,
                idventa integer NOT NULL,
                total numeric(12, 0) NOT NULL DEFAULT 0,
                total_gravado_iva10 numeric(10, 0) NOT NULL DEFAULT 0,
                total_gravado_iva5 numeric(10, 0) NOT NULL DEFAULT 0,
                total_exento_iva numeric(10, 0) NOT NULL DEFAULT 0,
                total_iva10 numeric(10, 0) NOT NULL DEFAULT 0,
                total_iva5 numeric(10, 0) NOT NULL DEFAULT 0,
                iddte integer NOT NULL,
                eliminado boolean NOT NULL DEFAULT false,
                PRIMARY KEY (id),
                CONSTRAINT fk_nota_credito_talonario FOREIGN KEY (idtalonario)
                    REFERENCES facturacion.talonario (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_nota_credito_cliente FOREIGN KEY (idcliente)
                    REFERENCES public.cliente (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_nota_credito_venta FOREIGN KEY (idventa)
                    REFERENCES public.venta (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_nota_credito_dte FOREIGN KEY (iddte)
                    REFERENCES facturacion.dte (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            );`
        );
        await queryRunner.query(
            `CREATE TABLE facturacion.nota_credito_detalle
            (
                id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
                idnota_credito integer NOT NULL,
                idservicio integer,
                idsuscripcion integer,
                idcuota integer,
                monto numeric(10, 0) NOT NULL DEFAULT 0,
                cantidad numeric(8, 0) NOT NULL DEFAULT 1,
                subtotal numeric(10, 0) NOT NULL DEFAULT 0,
                porcentaje_iva numeric(3, 0) NOT NULL DEFAULT 10,
                monto_iva numeric(10, 0) NOT NULL DEFAULT 0,
                descripcion character varying(200) NOT NULL,
                eliminado boolean NOT NULL DEFAULT false,
                PRIMARY KEY (id),
                CONSTRAINT fk_nota_credito_detalle_nota_credito FOREIGN KEY (idnota_credito)
                    REFERENCES facturacion.nota_credito (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_nota_credito_detalle_servicio FOREIGN KEY (idservicio)
                    REFERENCES public.servicio (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_nota_credito_detalle_suscripcion FOREIGN KEY (idsuscripcion)
                    REFERENCES public.suscripcion (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_nota_credito_detalle_cuota FOREIGN KEY (idcuota)
                    REFERENCES public.cuota (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            );`
        );
        await queryRunner.query(`CREATE TYPE facturacion.tipo_documento_type AS ENUM ('FAC', 'NCR', 'NDE');`);
        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.talonario
            ADD COLUMN tipo_documento facturacion.tipo_documento_type NOT NULL DEFAULT 'FAC';`
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.dte
            ADD COLUMN tipo_documento facturacion.tipo_documento_type NOT NULL DEFAULT 'FAC';`
        );
        await queryRunner.query(
            `INSERT INTO public.modulo(id, descripcion, eliminado)
            VALUES(43, 'Notas de crédito', false);`
        );
        await queryRunner.query(
            `INSERT INTO
                public.funcionalidad(id, idmodulo, nombre, descripcion, eliminado)
            VALUES
                (1300, 43, 'Acceso al módulo', NULL, false),
                (1301, 43, 'Consultar', NULL, false),
                (1302, 43, 'Registrar', NULL, false),
                (1303, 43, 'Editar', NULL, false),
                (1304, 43, 'Eliminar', NULL, false),
                (1305, 43, 'Anular', NULL, false);`
        );
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_notas_credito AS
            SELECT 
                nota_credito.id,
                concat(
                    to_char(talon_nota.cod_establecimiento::integer, 'fm000'::text),
                    '-',
                    to_char(talon_nota.cod_punto_emision::integer, 'fm000'::text)
                ) AS prefijonota,
                nota_credito.fecha_hora AS fechahora,
                nota_credito.nro_nota AS nronota,
                nota_credito.anulado,
                nota_credito.idtalonario,
                nota_credito.idcliente,
                cliente.razon_social AS razonsocial,
                cliente.ci AS ci,
                cliente.dv_ruc AS dvruc,
                nota_credito.idventa,
                nota_credito.total,
                nota_credito.total_gravado_iva10 AS totalgravadoiva10,
                nota_credito.total_gravado_iva5 AS totalgravadoiva5,
                nota_credito.total_exento_iva AS totalexentoiva,
                nota_credito.total_iva10 AS totaliva10,
                nota_credito.total_iva5 AS totaliva5,
                nota_credito.iddte,
                dte.idestado_documento_sifen AS idestadodte,
                concat(
                    to_char(talon_venta.cod_establecimiento::integer, 'fm000'::text),
                    '-',
                    to_char(talon_venta.cod_punto_emision::integer, 'fm000'::text),
                    '-',
                    to_char(venta.nro_factura::integer, 'fm0000000'::text)
                ) AS nrofactura,
                nota_credito.eliminado
            FROM facturacion.nota_credito
            JOIN public.cliente ON nota_credito.idcliente = cliente.id
            JOIN facturacion.talonario talon_nota ON nota_credito.idtalonario = talon_nota.id
            JOIN public.venta ON nota_credito.idventa = venta.id
            JOIN facturacion.talonario talon_venta ON venta.idtalonario = talon_venta.id
            JOIN facturacion.dte ON nota_credito.iddte = dte.id;`
        );
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_notas_credito_detalles AS
            SELECT
                nota_credito_detalle.id,
                nota_credito_detalle.idnota_credito AS idnotacredito,
                nota_credito_detalle.idservicio,
                nota_credito_detalle.idsuscripcion,
                nota_credito_detalle.idcuota,
                nota_credito_detalle.monto,
                nota_credito_detalle.cantidad,
                nota_credito_detalle.subtotal,
                nota_credito_detalle.porcentaje_iva AS porcentajeiva,
                nota_credito_detalle.monto_iva AS montoiva,
                nota_credito_detalle.descripcion,
                nota_credito_detalle.eliminado
            FROM facturacion.nota_credito_detalle;`
        );
        await this.createViewsUp(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);
        
        await queryRunner.query(`DELETE FROM public.evento_auditoria WHERE idtabla IN (40, 41);`);
        await queryRunner.query(`DELETE FROM public.tabla_auditoria WHERE id IN (40, 41);`);
        
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_notas_credito;`)
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_notas_credito_detalles;`)

        await queryRunner.query(`ALTER TABLE IF EXISTS facturacion.talonario DROP COLUMN IF EXISTS tipo_documento;`);
        await queryRunner.query(`ALTER TABLE IF EXISTS facturacion.dte DROP COLUMN IF EXISTS tipo_documento;`);
        await queryRunner.query(`DROP TYPE IF EXISTS facturacion.tipo_documento_type;`)

        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.nota_credito_detalle;`);
        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.nota_credito;`);

        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad IN (${this.idfuncionalidades.join(',')})`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE idmodulo = 43;`);
        await queryRunner.query(`DELETE FROM public.modulo WHERE id = 43;`);
        await this.createViewsDown(queryRunner);
    }

    private async dropViews(queryRunner: QueryRunner){
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_ventas;`);
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_talonarios;`);
    }

    private async createViewsUp(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas AS
            SELECT venta.id,
                venta.fecha_factura AS fechafactura,
                venta.fecha_hora_factura AS fechahorafactura,
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
                venta.idtalonario,
                talonario.nro_timbrado AS timbrado,
                timbrado.fecha_vencimiento AS vencimientotimbrado,
                timbrado.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtalonario IS NOT NULL THEN concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text))
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
                venta.iddte,
                dte.idestado_documento_sifen AS idestadodte,
                dte.fecha_cambio_estado AS fechacambioestadodte,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN facturacion.talonario ON talonario.id = venta.idtalonario
                LEFT JOIN facturacion.timbrado ON timbrado.nro_timbrado = talonario.nro_timbrado
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id
                LEFT JOIN facturacion.dte ON dte.id = venta.iddte;`
        );
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_talonarios AS
            SELECT talonario.id,
                talonario.cod_establecimiento AS codestablecimiento,
                talonario.cod_punto_emision AS codpuntoemision,
                concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text)) AS prefijo,
                talonario.nro_inicio AS nroinicio,
                talonario.nro_fin AS nrofin,
                to_char(timbrado.fecha_inicio_vigencia::timestamp with time zone, 'YYYY-MM-DD'::text) AS fechainicio,
                to_char(timbrado.fecha_vencimiento::timestamp with time zone, 'YYYY-MM-DD'::text) AS fechavencimiento,
                talonario.nro_timbrado AS nrotimbrado,
                talonario.ultimo_nro_usado AS ultimonrousado,
                talonario.activo,
                talonario.idformato_factura AS idformatofactura,
                timbrado.electronico,
                talonario.tipo_documento AS tipodocumento,
                talonario.eliminado
            FROM facturacion.talonario
                JOIN facturacion.timbrado ON talonario.nro_timbrado = timbrado.nro_timbrado;`
        );
    }

    private async createViewsDown(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas AS
            SELECT venta.id,
                venta.fecha_factura AS fechafactura,
                venta.fecha_hora_factura AS fechahorafactura,
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
                venta.idtalonario,
                talonario.nro_timbrado AS timbrado,
                timbrado.fecha_vencimiento AS vencimientotimbrado,
                timbrado.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtalonario IS NOT NULL THEN concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text))
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
                venta.iddte,
                dte.idestado_documento_sifen AS idestadofacturaelectronica,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN facturacion.talonario ON talonario.id = venta.idtalonario
                LEFT JOIN facturacion.timbrado ON timbrado.nro_timbrado = talonario.nro_timbrado
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id
                LEFT JOIN facturacion.dte ON dte.id = venta.iddte;`
        );

        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_talonarios AS
            SELECT talonario.id,
                talonario.cod_establecimiento AS codestablecimiento,
                talonario.cod_punto_emision AS codpuntoemision,
                concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text)) AS prefijo,
                talonario.nro_inicio AS nroinicio,
                talonario.nro_fin AS nrofin,
                to_char(timbrado.fecha_inicio_vigencia::timestamp with time zone, 'YYYY-MM-DD'::text) AS fechainicio,
                to_char(timbrado.fecha_vencimiento::timestamp with time zone, 'YYYY-MM-DD'::text) AS fechavencimiento,
                talonario.nro_timbrado AS nrotimbrado,
                talonario.ultimo_nro_usado AS ultimonrousado,
                talonario.activo,
                talonario.idformato_factura AS idformatofactura,
                timbrado.electronico,
                talonario.eliminado
            FROM facturacion.talonario
                JOIN facturacion.timbrado ON talonario.nro_timbrado = timbrado.nro_timbrado;`
        );
    }

}
