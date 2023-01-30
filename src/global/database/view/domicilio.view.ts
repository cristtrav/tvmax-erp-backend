import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_domicilios', expression: 'SELECT * FROM public.vw_domicilios'})
export class DomicilioView{
    
    @ViewColumn()
    id: number;

    @ViewColumn()
    direccion: string;

    @ViewColumn()
    nromedidor: string;

    @ViewColumn()
    idbarrio: number;

    @ViewColumn()
    barrio: string;

    @ViewColumn()
    tipo: string;

    @ViewColumn()
    idcliente: number;

    @ViewColumn()
    cliente: string;

    @ViewColumn()
    principal: boolean;

    @ViewColumn()
    iddistrito: number;

    @ViewColumn()
    distrito: string;

    @ViewColumn()
    iddepartamento: number;

    @ViewColumn()
    departamento: string;

    @ViewColumn()
    observacion: string;

    @ViewColumn()
    eliminado: boolean;
}