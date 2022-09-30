export class Cuota{
    id: number | null = null;
    idservicio: number | null = null;
    servicio: string | null = null;
    porcentajeiva: number | null = null;
    idsuscripcion: number | null = null;
    monto: number = 0;
    fechavencimiento: string | null = null;
    nrocuota: number | null = null;
    pagado: boolean = false;
    observacion: string | null = null;
}