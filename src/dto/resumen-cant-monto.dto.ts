export interface ResumenCantMonto{
    idreferencia?: string | number | null;
    referencia: string | number | null;
    cantidad: number | null;
    monto: number | null;
    children?: ResumenCantMonto[];
}