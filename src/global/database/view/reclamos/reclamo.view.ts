import { ViewColumn, ViewEntity } from "typeorm";

const SCHEMA_NAME = 'reclamos';
const VIEW_NAME = 'vw_reclamos';

@ViewEntity({schema: SCHEMA_NAME, name: VIEW_NAME, expression: `SELECT * FROM ${SCHEMA_NAME}.${VIEW_NAME}`})
export class ReclamoView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    fecha: Date;

    @ViewColumn()
    fechahoracambioestado: Date;

    @ViewColumn()
    observacionestado: string;

    @ViewColumn()
    idusuarioregistro: number;

    @ViewColumn()
    usuarioregistro: string;

    @ViewColumn()
    idusuarioresponsable: number;

    @ViewColumn()
    usuarioresponsable: string;

    @ViewColumn()
    idsuscripcion: number;

    @ViewColumn()
    idservicio: number;

    @ViewColumn()
    servicio: string;

    @ViewColumn()
    monto: number;

    @ViewColumn()
    idcliente: number;

    @ViewColumn()
    cliente: string;

    @ViewColumn()
    estado: string;

    @ViewColumn()
    eliminado: boolean;
}