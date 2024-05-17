import { MaterialUtilizadoDTO } from "./material-utilizado.dto";

export interface FinalizacionReclamoDTO {
    estado: string;
    observacionestado: string;
    personarecepciontecnico: string;
    materialesutilizados: MaterialUtilizadoDTO[];
}