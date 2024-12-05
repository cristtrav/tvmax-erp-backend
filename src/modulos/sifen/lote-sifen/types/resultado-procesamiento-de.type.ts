import { DetalleProcesamientoDEType } from "./detalle-procesamiento-de.type";

export type ResultadoProcesamientoDEType = {
    cdc: string;
    estado: string;
    codTransaccion: string;
    detalle: DetalleProcesamientoDEType
}