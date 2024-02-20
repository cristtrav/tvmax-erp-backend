import { DetalleReclamoDTO } from "./detalle-reclamo.dto";

export interface ReclamoDTO {
    id: number;
    fecha: Date;
    estado: string;
    fechahoracambioestado: Date;
    observacionestado: string;
    idusuarioregistro: number;
    idusuarioresponsable: number;
    idsuscripcion: number;
    eliminado: boolean;
    detalles: DetalleReclamoDTO[];
}