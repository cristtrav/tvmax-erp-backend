import { MigrationInterface, QueryRunner } from "typeorm";

export class TablaTimbrado1737079683447 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);
        await queryRunner.query(
            `CREATE TABLE facturacion.timbrado
            (
                nro_timbrado integer NOT NULL,
                fecha_inicio_vigencia date NOT NULL,
                fecha_vencimiento date,
                electronico boolean NOT NULL DEFAULT false,
                activo boolean NOT NULL DEFAULT true,
                eliminado boolean NOT NULL DEFAULT false,
                PRIMARY KEY (nro_timbrado)
            );`
        );
        await queryRunner.query(
            `INSERT INTO facturacion.timbrado
            SELECT
                talon_timbrado.nro_timbrado::integer,
                talon_data.fecha_inicio_vigencia,
                talon_data.fecha_vencimiento,
                talon_data.electronico,
                talon_data.activo,
                false
            FROM (SELECT DISTINCT nro_timbrado FROM facturacion.talonario) talon_timbrado
            JOIN LATERAL
                (SELECT * FROM facturacion.talonario talon_aux WHERE talon_aux.nro_timbrado = talon_timbrado.nro_timbrado LIMIT 1) talon_data
                ON talon_timbrado.nro_timbrado = talon_data.nro_timbrado`
        );
        await queryRunner.query(`ALTER TABLE facturacion.talonario ALTER COLUMN nro_timbrado TYPE integer;`);
        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.talonario
            ADD CONSTRAINT fk_talonario_timbrado FOREIGN KEY (nro_timbrado)
            REFERENCES facturacion.timbrado (nro_timbrado) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID;`
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.talonario DROP COLUMN IF EXISTS fecha_vencimiento;
            ALTER TABLE IF EXISTS facturacion.talonario DROP COLUMN IF EXISTS fecha_inicio_vigencia;
            ALTER TABLE IF EXISTS facturacion.talonario DROP COLUMN IF EXISTS electronico;`
        );
        await this.createViewsUp(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.dropViews(queryRunner);
        await queryRunner.query(`ALTER TABLE IF EXISTS facturacion.talonario DROP CONSTRAINT IF EXISTS fk_talonario_timbrado;`);
        await queryRunner.query(`ALTER TABLE facturacion.talonario ALTER COLUMN nro_timbrado TYPE numeric(8,0);`);
        await queryRunner.query(
            `ALTER TABLE IF EXISTS facturacion.talonario ADD COLUMN fecha_inicio_vigencia date NOT NULL DEFAULT NOW();
            ALTER TABLE IF EXISTS facturacion.talonario ADD COLUMN fecha_vencimiento date;
            ALTER TABLE IF EXISTS facturacion.talonario ADD COLUMN electronico boolean NOT NULL DEFAULT false;`
        );
        await queryRunner.query(
            `UPDATE facturacion.talonario
            SET
                fecha_inicio_vigencia = timbrado.fecha_inicio_vigencia,
                fecha_vencimiento = timbrado.fecha_vencimiento,
                electronico = timbrado.electronico
            FROM facturacion.timbrado
            WHERE timbrado.nro_timbrado = talonario.nro_timbrado;`
        );
        await queryRunner.query(`DROP TABLE IF EXISTS facturacion.timbrado;`);
        await this.createViewsDown(queryRunner);
    }

    private async dropViews(queryRunner: QueryRunner){
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_detalles_lotes;`);
        await queryRunner.query(`DROP VIEW IF EXISTS facturacion.vw_talonarios;`)
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_ventas_tributacion_exp;`);
        await queryRunner.query(`DROP VIEW IF EXISTS public.vw_ventas;`)
    }

    private async createViewsUp(queryRunner: QueryRunner){
        await this.createViewVwDetallesLotes(queryRunner);
        await this.createViewVwTalonariosUp(queryRunner);
        await this.createViewVwVentasTributacionExp(queryRunner);
        await this.createViewVwVentasUp(queryRunner);
    }

    private async createViewsDown(queryRunner: QueryRunner){
        await this.createViewVwDetallesLotes(queryRunner);
        await this.createViewVwTalonariosDown(queryRunner);
        await this.createViewVwVentasTributacionExp(queryRunner);
        await this.createViewVwVentasDown(queryRunner);
    }

    private async createViewVwDetallesLotes(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_detalles_lotes AS
            SELECT detalle_lote.idventa,
                detalle_lote.idlote,
                detalle_lote.codigo_estado AS codigoestado,
                detalle_lote.descripcion,
                talonario.nro_timbrado AS nrotimbrado,
                concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text)) AS prefijofactura,
                venta.nro_factura AS nrofactura,
                venta.fecha_factura AS fechafactura,
                venta.fecha_hora_factura AS fechahorafactura
            FROM facturacion.detalle_lote
                JOIN venta ON venta.id = detalle_lote.idventa
                JOIN facturacion.talonario ON talonario.id = venta.idtalonario;`
        );
    }

    private async createViewVwTalonariosDown(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_talonarios AS
            SELECT 
                id,
                cod_establecimiento AS codestablecimiento,
                cod_punto_emision AS codpuntoemision,
                concat(to_char(cod_establecimiento::double precision, 'fm000'::text), '-', to_char(cod_punto_emision::double precision, 'fm000'::text)) AS prefijo,
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
            FROM facturacion.talonario;`
        );
    }

    private async createViewVwTalonariosUp(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW facturacion.vw_talonarios AS
            SELECT
                id,
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

    private async createViewVwVentasTributacionExp(queryRunner: QueryRunner){
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
            talonario.nro_timbrado AS nrotimbrado,
            concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text), '-', to_char(venta.nro_factura, 'fm0000000'::text)) AS nrocomprobante,
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
            JOIN facturacion.talonario ON venta.idtalonario = talonario.id
        WHERE venta.eliminado = false AND venta.anulado = false
        ORDER BY venta.id, venta.fecha_factura;`
        );
    }

    private async createViewVwVentasUp(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas AS
            SELECT 
                venta.id,
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
                factura_electronica.idestado_documento_sifen AS idestadofacturaelectronica,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN facturacion.talonario ON talonario.id = venta.idtalonario
                LEFT JOIN facturacion.timbrado ON timbrado.nro_timbrado = talonario.nro_timbrado
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id
                LEFT JOIN facturacion.factura_electronica ON factura_electronica.idventa = venta.id;`
        );
    }

    private async createViewVwVentasDown(queryRunner: QueryRunner){
        await queryRunner.query(
            `CREATE OR REPLACE VIEW public.vw_ventas AS
            SELECT 
                venta.id,
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
                talonario.fecha_vencimiento AS vencimientotimbrado,
                talonario.fecha_inicio_vigencia AS iniciovigenciatimbrado,
                    CASE
                        WHEN venta.idtalonario IS NOT NULL THEN concat(to_char(talonario.cod_establecimiento::double precision, 'fm000'::text), '-', to_char(talonario.cod_punto_emision::double precision, 'fm000'::text))
                        ELSE NULL::text
                    END AS prefijofactura,
                talonario.electronico AS facturaelectronica,
                cobro.comision_para AS idcobradorcomision,
                btrim(concat(cobrador.nombres, ' ', cobrador.apellidos)) AS cobrador,
                cobro.fecha AS fechacobro,
                venta.idusuario_registro_factura AS idusuarioregistrofactura,
                btrim(concat(usuariofactura.nombres, ' ', usuariofactura.apellidos)) AS usuarioregistrofactura,
                cobro.cobrado_por AS idusuarioregistrocobro,
                btrim(concat(usuariocobro.nombres, ' ', usuariocobro.apellidos)) AS usuarioregistrocobro,
                factura_electronica.idestado_documento_sifen AS idestadofacturaelectronica,
                venta.eliminado
            FROM venta
                LEFT JOIN cliente ON cliente.id = venta.idcliente
                LEFT JOIN facturacion.talonario ON talonario.id = venta.idtalonario
                LEFT JOIN usuario usuariofactura ON venta.idusuario_registro_factura = usuariofactura.id
                LEFT JOIN cobro ON cobro.idventa = venta.id AND cobro.anulado = false AND cobro.eliminado = false
                LEFT JOIN usuario cobrador ON cobrador.id = cobro.comision_para
                LEFT JOIN usuario usuariocobro ON cobro.cobrado_por = usuariocobro.id
                LEFT JOIN facturacion.factura_electronica ON factura_electronica.idventa = venta.id;`
        );
    }

}
