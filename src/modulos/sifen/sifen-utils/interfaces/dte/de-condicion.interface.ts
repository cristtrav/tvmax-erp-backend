import { DECondicionOperacionType } from "../../types/dte/de-condicion-operacion.type";
import { DECreditoInterface } from "./de-credito.interface";
import { DEEntregaInterface } from "./de-entrega.interface";

export interface DECondicionInterface{
    tipo: DECondicionOperacionType;
    entregas?: [DEEntregaInterface, ...DEEntregaInterface[]];
    credito?: DECreditoInterface;
}