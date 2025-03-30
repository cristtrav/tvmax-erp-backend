import { AjusteMaterialIdentificableDTO } from "./ajuste-material-identificable.dto";

export interface AjusteExistenciaDTO {
    id: number;
    fechahora: string;
    idmaterial: number;
    material: string;
    unidadmedida: string;
    cantidadanterior: string;
    cantidadnueva: string;
    idusuario: number;
    usuario: string;
    ultimoid: boolean;
    eliminado: boolean;
    ajustesmaterialesidentificables?: AjusteMaterialIdentificableDTO[]
}