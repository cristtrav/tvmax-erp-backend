import { ViewColumn, ViewEntity } from "typeorm";

const SCHEMA_NAME = 'public';
const VIEW_NAME = 'vw_ventas_tributacion_exp'

@ViewEntity({schema: SCHEMA_NAME, name: VIEW_NAME, expression: `SELECT * FROM ${SCHEMA_NAME}.${VIEW_NAME}`})
export class VentaTributacionExpView {

    @ViewColumn()
    tiporegistro: number;

    @ViewColumn()
    tipoidentificacion: number;

    @ViewColumn()
    ci: string;

    @ViewColumn()
    fecha: string;

    @ViewColumn()
    razonsocial: string;

    @ViewColumn()
    tipocomprobante: number;

    @ViewColumn()
    nrotimbrado: number;

    @ViewColumn()
    nrocomprobante: string;

    @ViewColumn()
    gravadoiva10: number;

    @ViewColumn()
    gravadoiva5: number;

    @ViewColumn()
    exento: number;

    @ViewColumn()
    total: number;

    @ViewColumn()
    condicion: number;

    @ViewColumn()
    monedaextranjera: string;

    @ViewColumn()
    imputaiva: string;

    @ViewColumn()
    imputaire: string;

    @ViewColumn()
    imputairp: string;

}