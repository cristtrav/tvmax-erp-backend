export interface DetalleMovimientoMaterialDTO {
    id?: number;
    idmovimiento?: number;
    idmaterial: number;
    material?: string;
    unidadmedida: string;
    cantidad: string;
    cantidadanterior?: string;
    descripcion?: string;
    iddetallemovimientoreferencia?: number;
    eliminado: boolean;
}