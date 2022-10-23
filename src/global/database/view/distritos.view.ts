import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_distritos', expression: 'SELECT * FROM public.vw_distritos'})
export class DistritoView{
    @ViewColumn()
    id: string;
    
    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    iddepartamento: string;
    
    @ViewColumn()
    departamento: string;

    @ViewColumn()
    eliminado: boolean
}