import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_barrios', expression: 'SELECT * FROM public.vw_barrios'})
export class BarrioView{
    @ViewColumn()
    id: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    iddistrito: string;

    @ViewColumn()
    distrito: string;

    @ViewColumn()
    iddepartamento: string;

    @ViewColumn()
    departamento: string;

    @ViewColumn()
    eliminado: boolean;

}