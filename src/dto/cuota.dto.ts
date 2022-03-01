export class Cuota{
    id: number | null = null;
    idservicio: number | null = null;
    servicio: string | null = null;
    idsuscripcion: number | null = null;
    monto: number = 0;
    fechavencimiento: string | null = null;
    nrocuota: number | null = null;
    pagado: boolean = false;
    fechapago: string | null = null;
    facturapago: string | null = null;
    observacion: string | null = null;
    porcentajeiva: number | null = null;
}