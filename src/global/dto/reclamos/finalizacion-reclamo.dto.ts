import { MaterialUtilizadoDTO } from "./material-utilizado.dto";

export interface FinalizacionReclamoDTO {
    estado: string;
    observacionestado: string;
    materialesutilizados: MaterialUtilizadoDTO[];
}