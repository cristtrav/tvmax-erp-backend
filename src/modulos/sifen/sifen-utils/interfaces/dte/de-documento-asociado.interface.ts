import { DEFormatoDocumentoAsociadoType } from "../../types/dte/de-formato-documento-asociado.type";
import { DETipoDocumentoType } from "../../types/dte/de-tipo-documento.type";

export interface DEDocumentoAsociadoInterface{
    formato: DEFormatoDocumentoAsociadoType;
    cdc: string;
    tipo: DETipoDocumentoType;
    timbrado: string;
    establecimiento: string;
    punto: string;
    numero: string;
    fecha: string;
}