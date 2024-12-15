import { ViewColumn, ViewEntity } from "typeorm";

const SCHEMA_NAME = 'facturacion';
const VIEW_NAME = 'vw_detalles_lotes';

@ViewEntity({name: VIEW_NAME, schema: SCHEMA_NAME, expression: `SELECT * FROM ${SCHEMA_NAME}.${VIEW_NAME}`})
export class DetalleLoteView{
    
    @ViewColumn()
    idventa: number;

    @ViewColumn()
    idlote: number;

    @ViewColumn()
    codigoestado: string;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    nrotimbrado: number;

    @ViewColumn()
    prefijofactura: string;

    @ViewColumn()
    nrofactura: number;

    @ViewColumn()
    fechahorafactura: string;

    @ViewColumn()
    fechafactura: string;
}