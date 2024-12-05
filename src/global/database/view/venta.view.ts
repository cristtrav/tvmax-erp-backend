import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_ventas', expression: 'SELECT * FROM public.vw_ventas'})
export class VentaView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    fechafactura: Date;

    @ViewColumn()
    totalgravadoiva10: number;

    @ViewColumn()
    totalgravadoiva5: number;

    @ViewColumn()
    totalexentoiva: number;

    @ViewColumn()
    totaliva10: number;

    @ViewColumn()
    totaliva5: number;

    @ViewColumn()
    total: number;

    @ViewColumn()
    pagado: boolean;

    @ViewColumn()
    anulado: boolean;

    @ViewColumn()
    idcliente: number;

    @ViewColumn()
    cliente: string;

    @ViewColumn()
    ci: number;

    @ViewColumn()
    dvruc: number;

    @ViewColumn()
    nrofactura: number;

    @ViewColumn()
    idtimbrado: number;

    @ViewColumn()
    timbrado: number;

    @ViewColumn()
    vencimientotimbrado: Date;

    @ViewColumn()
    iniciovigenciatimbrado: Date;

    @ViewColumn()
    prefijofactura: string;

    @ViewColumn()
    facturaelectronica: boolean;

    @ViewColumn()
    idcobradorcomision: number;

    @ViewColumn()
    cobrador: string;

    @ViewColumn()
    fechacobro: Date;

    @ViewColumn()
    idusuarioregistrofactura: number;

    @ViewColumn()
    usuarioregistrofactura: string;

    @ViewColumn()
    idusuarioregistrocobro: number;

    @ViewColumn()
    usuarioregistrocobro: string;

    @ViewColumn()
    idestadofacturaelectronica: number;

    @ViewColumn()
    eliminado: boolean;

}