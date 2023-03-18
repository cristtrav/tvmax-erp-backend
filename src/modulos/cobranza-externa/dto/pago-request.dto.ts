export interface PagoRequestDTO{
    codServicio: "00001";
    tipoTrx: 3;
    usuario: string;
    password: string;
    nroOperacion: number;
    nroCuota: number;
    importe: string;
    moneda: "1" | "2";
    codTransaccion: number;
}