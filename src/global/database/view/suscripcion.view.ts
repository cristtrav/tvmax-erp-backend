import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_suscripciones', expression: 'SELECT * FROM public.vw_suscripciones'})
export class SuscripcionView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    monto: number;

    @ViewColumn()
    estado: string;

    @ViewColumn()
    fechacambioestado: Date;

    @ViewColumn()
    fechasuscripcion: Date;

    @ViewColumn()
    idcliente: number;

    @ViewColumn()
    cliente: string;

    @ViewColumn()
    ci: string;

    @ViewColumn()
    dvruc: number;

    @ViewColumn()
    telefono1: string;

    @ViewColumn()
    telefono2: string;

    @ViewColumn()
    iddomicilio: number;

    @ViewColumn()
    direccion: string;

    @ViewColumn()
    obsdomicilio: string;

    @ViewColumn()
    nromedidor: string;

    @ViewColumn()
    idbarrio: number;

    @ViewColumn()
    barrio: string;

    @ViewColumn()
    iddistrito: number;

    @ViewColumn()
    distrito: string;

    @ViewColumn()
    iddepartamento: number;

    @ViewColumn()
    departamento: string;

    @ViewColumn()
    idservicio: number;

    @ViewColumn()
    servicio: string;

    @ViewColumn()
    idgrupo: number;

    @ViewColumn()
    grupo: string;

    @ViewColumn()
    cuotaspendientes: number;

    @ViewColumn()
    deuda: number;

    @ViewColumn()
    eliminado: boolean;

    @ViewColumn()
    gentileza: boolean;

    @ViewColumn()
    idcobrador: number;

    @ViewColumn()
    cobrador: string;

    @ViewColumn()
    observacion: string;

}