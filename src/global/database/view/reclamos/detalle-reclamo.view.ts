import { ViewColumn, ViewEntity } from "typeorm";

const SCHEMA_NAME = 'reclamos';
const VIEW_NAME = 'vw_detalles_reclamos';

@ViewEntity({schema: SCHEMA_NAME, name: VIEW_NAME, expression: `SELECT * FROM ${SCHEMA_NAME}.${VIEW_NAME}`})
export class DetalleReclamoView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    idreclamo: number;

    @ViewColumn()
    idmotivo: number;

    @ViewColumn()
    motivo: string;

    @ViewColumn()
    observacion: string;

    @ViewColumn()
    eliminado: boolean;

}