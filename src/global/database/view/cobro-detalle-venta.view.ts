import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_cobro_detalle_venta', expression: 'SELECT * FROM public.vw_cobro_detalle_venta'})
export class CobroDetalleVentaView{

    @ViewColumn()
    iddetalleventa: number;

    @ViewColumn()
    idventa: number;

    @ViewColumn()
    idsuscripcion: number;

    @ViewColumn()
    monto: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    idservicio: number;

    @ViewColumn()
    servicio: string;

    @ViewColumn()
    idgrupo: number;

    @ViewColumn()
    grupo: string;

    @ViewColumn()
    fechavencimiento: Date;

    @ViewColumn()
    idcuota: number;

    @ViewColumn()
    cliente: string;

    @ViewColumn()
    ci: string;

    @ViewColumn()
    dvruc: number;

    @ViewColumn()
    fechafactura: Date;

    @ViewColumn()
    pagado: boolean;

    @ViewColumn()
    anulado: boolean;

    @ViewColumn()
    facturacobro: string;

    @ViewColumn()
    fechacobro: Date;

    @ViewColumn()
    idcobradorcomision: number;

    @ViewColumn()
    cobrador: string;

    @ViewColumn()
    idusuarioregistrocobro: number;

    @ViewColumn()
    usuarioregistrocobro: string;

    @ViewColumn()
    eliminado: boolean;

}