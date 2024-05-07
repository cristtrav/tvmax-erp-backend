import { ViewColumn, ViewEntity } from "typeorm";

const SCHEMA_NAME = 'reclamos';
const VIEW_NAME = 'vw_materiales_utilizados';

@ViewEntity({schema: SCHEMA_NAME, name: VIEW_NAME, expression: `SELECT * FROM ${SCHEMA_NAME}.${VIEW_NAME}`})
export class MaterialUtilizadoView {

    @ViewColumn()
    id: number;

    @ViewColumn()
    idreclamo: number;

    @ViewColumn()
    cantidad: string;

    @ViewColumn()
    idmaterial: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    unidadmedida: string;

    @ViewColumn()
    eliminado: boolean;

}