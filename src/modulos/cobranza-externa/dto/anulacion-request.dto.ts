export interface AnulacionRequestDTO{
    codServicio: "00001";
    tipoTrx: 4 | 6;
    usuario: string;
    password: string;
    nroOperacion: number;
    nroCuota: number;
    importe: string;
    moneda: "1" | "2";
    codTransaccion: number;
    codTransaccionAnular: number;
}