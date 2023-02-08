import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_cobro_cuotas', expression: 'SELECT * FROM public.vw_cobro_cuotas'})
export class CobroCuotasView{

    @ViewColumn()
    idcuota: number;

    @ViewColumn()
    fechacobro: Date;

    @ViewColumn()
    facturacobro: string;

    @ViewColumn()
    idcobrador: number;

    @ViewColumn()
    cobrador: string;

    @ViewColumn()
    idusuario: number;

    @ViewColumn()
    usuario: string;

}