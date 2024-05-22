export interface MaterialUtilizadoDTO{
    id: number;
    descripcion: string;
    idreclamo: number;
    idmaterial: number;
    unidadmedida?: string;
    cantidad: string;
    eliminado: boolean;
}