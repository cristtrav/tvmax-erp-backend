import { JoinColumn, ManyToOne, ViewColumn, ViewEntity } from "typeorm";
import { VentaView } from "./venta.view";

@ViewEntity({name: 'vw_detalles_venta', expression: 'SELECT * FROM public.vw_detalles_ventas'})
export class DetalleVentaView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    idventa: number;

    @ViewColumn()
    monto: number;

    @ViewColumn()
    cantidad: number;

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

    @ViewColumn()
    montoiva: number;

}