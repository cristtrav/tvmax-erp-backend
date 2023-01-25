import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_timbrados', expression: 'SELECT * FROM public.vw_timbrados'})
export class TimbradoView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    codestablecimiento: number;

    @ViewColumn()
    codpuntoemision: number;

    @ViewColumn()
    prefijo: string;

    @ViewColumn()
    nroinicio: number;

    @ViewColumn()
    nrofin: number;

    @ViewColumn()
    fechainicio: string;

    @ViewColumn()
    fechavencimiento: string;

    @ViewColumn()
    nrotimbrado: number;

    @ViewColumn()
    ultimonrousado: number;

    @ViewColumn()
    activo: boolean;

    @ViewColumn()
    eliminado: boolean;

}