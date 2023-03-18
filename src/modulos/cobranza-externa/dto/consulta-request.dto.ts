export interface ConsultaRequestDTO {
    codServicio: "00001";
    tipoTrx: 5;
    usuario: string;
    password: string;
    nroDocumento: string;
    moneda: "1" | "2";
}