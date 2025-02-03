import { DETipoIvaType } from "../../types/dte/de-tipo-iva.type";

export interface DEItemInterface {
    codigo: string; //codigo interno
    descripcion: string;
    observacion?: string;
    unidadMedida: 77; //Unidad segun la tabla oficial
    cantidad: number;
    precioUnitario: number;
    cambio?: number;
    descuento?: number;
    anticipo?: number;
    pais: "PRY";
    paisDescripcion: "Paraguay";
    ivaTipo: DETipoIvaType;
    ivaBase: number;
    iva: 0 | 5 | 10;
}