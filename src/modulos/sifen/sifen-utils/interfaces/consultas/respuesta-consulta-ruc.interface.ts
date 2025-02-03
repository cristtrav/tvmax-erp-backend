import { DetalleConsultaRucInterface } from "./detalle-ruc.interface";

export interface RespuestaConsultaRucInterface {
    codigo: string;
    mensaje: string;
    detalleRuc: DetalleConsultaRucInterface | null
}