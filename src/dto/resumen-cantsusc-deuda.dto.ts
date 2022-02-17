export interface ResumenCantSuscDeuda{
    idreferencia?: string | number | null;
    referencia: string | number | null;
    cantidad: number | null;
    monto: number | null;
    children?: ResumenCantSuscDeuda[];
}