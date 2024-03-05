import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_usuarios', expression: 'SELECT * FROM public.vw_usuarios'})
export class UsuarioView{

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
    accesosistema: boolean;

    @ViewColumn()
    email: string;

    @ViewColumn()
    telefono: string;

    @ViewColumn()
    eliminado: boolean;

    @ViewColumn()
    sololectura: boolean;

    @ViewColumn()
    idroles: number[];
}