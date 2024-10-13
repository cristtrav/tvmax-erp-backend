import { DETipoEntregaType } from "../types/de-tipo-entrega.type";

export interface DEEntregaInterface{
    tipo: DETipoEntregaType;
    monto: string;
    moneda: "PYG"
    cambio: number;
}