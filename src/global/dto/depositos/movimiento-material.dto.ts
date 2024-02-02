import { DetalleMovimientoMaterialDTO } from "./detalle-movimiento-material.dto";

export interface MovimientoMaterialDTO{
    id: number;
    fecha: Date;
    idusuarioresponsable: number;
    idusuarioentrega: number;
    tipomovimiento: string;
    observacion?: string;
    idmovimientoreferencia?: number;
    devuelto: boolean;    
    eliminado: boolean;
    detalles: DetalleMovimientoMaterialDTO[]
}