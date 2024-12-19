import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_servicios', expression: 'SELECT * FROM public.vw_servicios'})
export class ServicioView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    precio: number;

    @ViewColumn()
    suscribible: boolean;

    @ViewColumn()
    idgrupo: number;

    @ViewColumn()
    porcentajeiva: number;

    @ViewColumn()
    grupo: string;

    @ViewColumn()
    facturarsinsuscripcion: boolean;

    @ViewColumn()
    eliminado: boolean;

}