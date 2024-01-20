import { ViewColumn, ViewEntity } from "typeorm";

const SCHEMA: string = 'depositos';
const VIEW_NAME: string = 'vw_tipos_materiales'

@ViewEntity({schema: SCHEMA, name: VIEW_NAME, expression: `SELECT * FROM ${SCHEMA}.${VIEW_NAME}`})
export class TipoMaterialView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    sololectura: boolean;

    @ViewColumn()
    eliminado: boolean;

}