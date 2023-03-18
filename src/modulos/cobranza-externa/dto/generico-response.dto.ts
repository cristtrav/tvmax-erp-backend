export interface GenericoResponseDTO{
    codServicio: "00001";
    tipoTrx: 3 | 4 | 5 | 6;
    codRetorno: "000" | "001" | "999";
    desRetorno: string;
}