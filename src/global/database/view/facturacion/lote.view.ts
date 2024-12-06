import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_lotes';
const SCHEMA_NAME = 'facturacion';

@ViewEntity({schema: SCHEMA_NAME, name: VIEW_NAME, expression: `SELECT * FROM ${SCHEMA_NAME}.${VIEW_NAME}`})
export class LoteView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    fechahoracreacion: string;

    @ViewColumn()
    fechahoraenvio: string;

    @ViewColumn()
    fechahoraconsulta: string;

    @ViewColumn()
    enviado: boolean;

    @ViewColumn()
    aceptado: boolean;

    @ViewColumn()
    consultado: boolean;

    @ViewColumn()
    nrolotesifen: string;

    @ViewColumn()
    observacion: string;

    @ViewColumn()
    cantidadfacturas: number;

}