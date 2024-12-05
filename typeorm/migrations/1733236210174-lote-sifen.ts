import { MigrationInterface, QueryRunner } from "typeorm";

export class LoteSifen1733236210174 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE facturacion.lote
            (
                id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
                fecha_hora_creacion timestamp with time zone NOT NULL DEFAULT NOW(),
                fecha_hora_consulta timestamp with time zone,
                fecha_hora_envio timestamp with time zone,
                enviado boolean NOT NULL DEFAULT false,
                aceptado boolean NOT NULL DEFAULT false,
                consultado boolean NOT NULL DEFAULT false,
                nro_lote_sifen character varying(25),
                observacion text,
                PRIMARY KEY (id)
            )`
        );
        await queryRunner.query(
            `CREATE TABLE facturacion.lote_factura
            (
                idventa integer NOT NULL,
                idlote integer NOT NULL,
                PRIMARY KEY (idventa, idlote),
                CONSTRAINT fk_lote_factura_factura_electronica FOREIGN KEY (idventa)
                    REFERENCES facturacion.factura_electronica (idventa) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT fk_lote_factura_lote FOREIGN KEY (idlote)
                    REFERENCES facturacion.lote (id) MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            )`
        );
        await queryRunner.query(
            `INSERT INTO public.tabla_auditoria(id, descripcion)VALUES(37, 'Lote SIFEN')`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE facturacion.lote_factura`)
        await queryRunner.query(`DROP TABLE facturacion.lote`);
        await queryRunner.query(`DELETE FROM public.evento_auditoria WHERE idtabla = 37`);
        await queryRunner.query(`DELETE FROM public.tabla_auditoria WHERE id = 37`)
    }

}
