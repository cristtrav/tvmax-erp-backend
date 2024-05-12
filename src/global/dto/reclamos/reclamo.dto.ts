import { DetalleReclamoDTO } from "./detalle-reclamo.dto";

export interface ReclamoDTO {
    id?: number;
    fecha: Date;
    estado: string;
    fechahoracambioestado?: Date;
    observacionestado?: string;
    idusuarioregistro?: number;
    usuarioregistro?: string;
    idusuarioresponsable?: number;
    usuarioresponsable?: string;
    idsuscripcion: number;
    idservicio?: number;
    servicio?: string;
    monto?: number;
    idcliente?: number;
    cliente?: string;
    eliminado: boolean;
    detalles: DetalleReclamoDTO[];
    observacion?: string;
    telefono?: string;
}