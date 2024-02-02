export class CobroDTO{
    id: number | null = null;
    idventa: number | null = null;
    fecha: string | null = null;
    anulado: boolean = false;
    nrorecibo: string | null = null;
    idcomisionpara: number | null = null;
    comisionpara: string | null = null;
    idcobradopor: number | null = null;
    cobradopornombre: string | null = null;
    cobradoporapellido: string | null = null;
    eliminado: boolean = false;
}