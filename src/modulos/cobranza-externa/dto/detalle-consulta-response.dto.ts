export interface DetalleConsultaResponseDTO{
    nroOperacion: number;
    desOperacion: string;
    nroCuota?: number;
    totalDetalle: string;
    iva10: string;
    iva5: string;
    moneda: "1" | "2";
    fechaVencimiento: string;
    direccionDomicilio?: string;
}