import { DETipoContribuyenteType } from "../../types/dte/de-tipo-contribuyente.type";
import { DETipoRegimenType } from "../../types/dte/de-tipo-regimen.type";
import { DEVersionType } from "../../types/dte/de-version.type";
import { DEActividadEconomicaInterface } from "./de-actividad-economica.interface";
import { DEEstablecimientoInterface } from "./de-establecimiento.interface";

export interface DEParamsInterface {
    version: DEVersionType;
    ruc: string;
    razonSocial: string;
    nombreFantasia?: string;
    actividadesEconomicas: DEActividadEconomicaInterface[];
    timbradoNumero: string;
    timbradoFecha: string;
    tipoContribuyente: DETipoContribuyenteType;
    tipoRegimen: DETipoRegimenType;
    establecimientos: DEEstablecimientoInterface[];
}

