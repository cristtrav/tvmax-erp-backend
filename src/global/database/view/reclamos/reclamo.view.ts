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
    iddomicilio: number;

    @ViewColumn()
    direccion: string;

    @ViewColumn()
    latitud: number;

    @ViewColumn()
    longitud: number;

    @ViewColumn()
    idbarrio: number;

    @ViewColumn()
    barrio: string

    @ViewColumn()
    obsdomicilio: string;

    @ViewColumn()
    idservicio: number;

    @ViewColumn()
    servicio: string;

    @ViewColumn()
    monto: number;

    @ViewColumn()
    obssuscripcion: string;

    @ViewColumn()
    idcliente: number;

    @ViewColumn()
    cliente: string;

    @ViewColumn()
    estado: string;

    @ViewColumn()
    eliminado: boolean;

    @ViewColumn()
    observacion: string;

    @ViewColumn()
    telefono: string;

    @ViewColumn()
    motivopostergacion: string;

    @ViewColumn()
    nroreiteraciones: number;
}