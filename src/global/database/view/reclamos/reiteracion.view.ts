import { View, ViewColumn, ViewEntity } from "typeorm";

const SCHEMA_NAME = 'reclamos';
const VIEW_NAME = 'vw_reiteraciones'

@ViewEntity({schema: SCHEMA_NAME, name: VIEW_NAME, expression: `SELECT * FROM ${SCHEMA_NAME}.${VIEW_NAME}`})
export class ReiteracionView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    idreclamo: number;

    @ViewColumn()
    fechahora: string;

    @ViewColumn()
    observacion: string;

    @ViewColumn()
    eliminado: boolean;
    
}