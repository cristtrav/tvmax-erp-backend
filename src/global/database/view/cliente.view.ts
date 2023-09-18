import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_clientes', expression: 'SELECT * FROM public.vw_clientes'})
export class ClienteView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    nombres: string;

    @ViewColumn()
    apellidos: string;

    @ViewColumn()
    razonsocial: string;

    @ViewColumn()
    ci: string;

    @ViewColumn()
    dvruc: number;

    @ViewColumn()
    telefono1: string;

    @ViewColumn()
    telefono2: string;
    
    @ViewColumn()
    email: string;

    @ViewColumn()
    idcobrador: number;

    @ViewColumn()
    cobrador: string;

    @ViewColumn()
    iddomicilio: number;

    @ViewColumn()
    direccion: string;

    @ViewColumn()
    obsdomicilio: string;

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
    cantconectados: number;

    @ViewColumn()
    cantdesconectados: number;

    @ViewColumn()
    eliminado: boolean;

}