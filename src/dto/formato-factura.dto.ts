export interface FormatoFacturaDTO{
    id: number;
    descripcion: string;
    tipoFactura: 'PRE' | 'AUT' | 'ELEC';
    plantilla: 'PRE-A';
    parametros: {[name: string]: any}
    eliminado: boolean;
}