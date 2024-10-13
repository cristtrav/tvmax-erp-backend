import { DEActividadEconomicaInterface } from "./de-actividad-economica.interface";
import { DEVersionType } from "../types/de-version.type";
import { DETipoContribuyenteType } from "../types/de-tipo-contribuyente.type";
import { DETipoRegimenType } from "../types/de-tipo-regimen.type";
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

