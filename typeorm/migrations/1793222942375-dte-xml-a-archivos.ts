import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Fase 1 de la transición del XML de DTE a archivos en disco (ver docs/plan-transicion-xml-dte.md).
 * - Agrega la columna cdc (referencia al archivo) y la completa desde el XML.
 * - La columna xml deja de ser obligatoria. Se elimina en la fase 4.
 * cdc queda nullable a propósito: durante el deploy el código anterior sigue
 * insertando DTE sin cdc. El script typeorm/scripts/exportar-xml-dte.ts los completa.
 */
export class DteXmlAArchivos1793222942375 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE facturacion.dte ADD COLUMN cdc varchar(44);`);
        await queryRunner.query(`
            UPDATE facturacion.dte
            SET cdc = (xpath(
                '/s:rDE/s:DE/@Id',
                xml,
                ARRAY[ARRAY['s', 'http://ekuatia.set.gov.py/sifen/xsd']]
            ))[1]::text;
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX uq_dte_cdc ON facturacion.dte(cdc);`);
        await queryRunner.query(`ALTER TABLE facturacion.dte ALTER COLUMN xml DROP NOT NULL;`);
        await queryRunner.query(`
            COMMENT ON COLUMN facturacion.dte.cdc IS
            'Código de Control (CDC) del DTE. El XML se almacena en {DTE_XML_FOLDER}/AAAA/MM/{cdc}.xml';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const [{ cantidad }] = await queryRunner.query(`SELECT COUNT(*)::int AS cantidad FROM facturacion.dte WHERE xml IS NULL;`);
        if(cantidad > 0) throw new Error(
            `Hay ${cantidad} DTE sin XML en la base de datos. ` +
            `Ejecutar primero: npm run dte:exportar-xml -- --restaurar`
        );
        await queryRunner.query(`ALTER TABLE facturacion.dte ALTER COLUMN xml SET NOT NULL;`);
        await queryRunner.query(`DROP INDEX facturacion.uq_dte_cdc;`);
        await queryRunner.query(`ALTER TABLE facturacion.dte DROP COLUMN cdc;`);
    }

}
