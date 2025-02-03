import { DECondicionOperacionType } from "../../types/dte/de-condicion-operacion.type";
import { DEEntregaInterface } from "./de-entrega.interface";

export interface DECondicionInterface{
    tipo: DECondicionOperacionType;
    entregas: [DEEntregaInterface, ...DEEntregaInterface[]];
}