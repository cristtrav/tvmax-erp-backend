import { DETipoContribuyenteType } from "../types/de-tipo-contribuyente.type";
import { DETipoDocumentoReceptor } from "../types/de-tipo-documento-receptor.type";
import { DETipoOperacionType } from "../types/de-tipo-operacion.type";

export interface DEClienteInterface {
    contribuyente: boolean;
    ruc?: string;
    razonSocial: string;
    nombreFantasia?: string;
    tipoOperacion: DETipoOperacionType;
    tipoContribuyente: DETipoContribuyenteType;
    pais: "PRY";
    paisDescripcion: "Paraguay";
    documentoTipo: DETipoDocumentoReceptor;
    documentoNumero: string;
    telefono?: string;
    celular?: string;
    email?: string;
    codigo?: string;
    direccion?: string;
}