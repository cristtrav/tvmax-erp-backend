import { ViewColumn, ViewEntity } from "typeorm";

const SCHEMA_NAME = 'reclamos';
const VIEW_NAME = 'vw_eventos_cambios_estados';

@ViewEntity({schema: SCHEMA_NAME, name: VIEW_NAME, expression: `SELECT * FROM ${SCHEMA_NAME}.${VIEW_NAME}`})
export class EventosCambiosEstadosView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    idreclamo: number;

    @ViewColumn()
    estado: string;

    @ViewColumn()
    fechahora: Date;

    @ViewColumn()
    observacion: string;

}