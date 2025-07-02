import { DETipoDocumentoType } from "../../types/dte/de-tipo-documento.type";
import { DETipoEmisionType } from "../../types/dte/de-tipo-emision.type";
import { DETipoImpuestoType } from "../../types/dte/de-tipo-impuesto.type";
import { DETipoTransaccionType } from "../../types/dte/de-tipo-transaccion.type";
import { DEClienteInterface } from "./de-cliente.interface";
import { DECondicionInterface } from "./de-condicion.interface";
import { DECreditoInterface } from "./de-credito.interface";
import { DEDocumentoAsociadoInterface } from "./de-documento-asociado.interface";
import { DEFacturaInterface } from "./de-factura.interface";
import { DEItemInterface } from "./de-item.interface";
import { DENotaCreditoDebito } from "./de-notacreditodebito.interface";

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
    documentoAsociado?: DEDocumentoAsociadoInterface;
    notaCreditoDebito?: DENotaCreditoDebito;
}