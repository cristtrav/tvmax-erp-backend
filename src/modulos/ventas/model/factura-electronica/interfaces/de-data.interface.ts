import { DETipoDocumentoType } from "../types/de-tipo-documento.type";
import { DETipoEmisionType } from "../types/de-tipo-emision.type";
import { DETipoImpuestoType } from "../types/de-tipo-impuesto.type";
import { DETipoTransaccionType } from "../types/de-tipo-transaccion.type";
import { DEClienteInterface } from "./de-cliente.interface";
import { DECondicionInterface } from "./de-condicion.interface";
import { DEFacturaInterface } from "./de-factura.interface";
import { DEItemInterface } from "./de-item.interface";

export interface DEDataInterface{
    tipoDocumento: DETipoDocumentoType
    establecimiento: string;
    codigoSeguridadAleatorio: string;
    punto: string;
    numero: string;
    fecha: string;
    tipoEmision: DETipoEmisionType;
    tipoTransaccion: DETipoTransaccionType;
    tipoImpuesto: DETipoImpuestoType;
    moneda: "PYG";
    cliente: DEClienteInterface;
    factura: DEFacturaInterface;
    condicion: DECondicionInterface;
    items: DEItemInterface[];
}