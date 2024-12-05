import { DetalleConsultaRucType } from "./detalle-ruc.type";

export type RespuestaConsultaRucType = {
    codigo: string;
    mensaje: string;
    detalleRuc: DetalleConsultaRucType | null
}