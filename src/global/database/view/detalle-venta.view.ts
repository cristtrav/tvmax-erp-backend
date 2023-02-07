import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_detalles_ventas', expression: 'SELECT * FROM public.vw_detalles_ventas'})
export class DetalleVentaView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    idventa: number;

    @ViewColumn()
    monto: number;

    @ViewColumn()
    cantiad: number;

    @ViewColumn()
    subtotal: number;

    @ViewColumn()
    porcentajeiva: number;

    @ViewColumn()
    liquidacioniva: number;

    @ViewColumn()
    gravadoiva: number;

    @ViewColumn()
    idservicio: number;

    @ViewColumn()
    servicio: string;

    @ViewColumn()
    idgrupo: number;

    @ViewColumn()
    grupo: string;

    @ViewColumn()
    idcuota: number;

    @ViewColumn()
    idsuscripcion: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    eliminado: boolean;

}