import { ResultadoProcesamientoDEType } from "./resultado-procesamiento-de.type"

export type ResultadoProcesamientoLoteType = {
    idlote: number,
    fecha: Date | null,
    codigo: string,
    mensaje: string,
    resultados: ResultadoProcesamientoDEType[]
}