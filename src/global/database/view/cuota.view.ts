import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_cuotas', expression: 'SELECT * FROM public.vw_cuotas'})
export class CuotaView{
    
    @ViewColumn()
    id: number;

    @ViewColumn()
    observacion: string;

    @ViewColumn()
    fechavencimiento: Date;

    @ViewColumn()
    monto: number;

    @ViewColumn()
    nrocuota: number;

    @ViewColumn()
    idsuscripcion: number;

    @ViewColumn()
    idservicio: number;

    @ViewColumn()
    servicio: string;

    @ViewColumn()
    porcentajeiva: number;

    @ViewColumn()
    pagado: boolean;

    @ViewColumn()
    eliminado: boolean;
}