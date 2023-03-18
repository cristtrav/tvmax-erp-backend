import { DetalleConsultaResponseDTO } from "./detalle-consulta-response.dto";

export interface ConsultaResponseDTO {
    codServicio: "00001"
    tipoTrx: 5;
    codRetorno: "000" | "001" | "999";
    desRetorno?: string;
    nombreApellido?: string;
    cantFilas: number;
    detalles: DetalleConsultaResponseDTO[];
}