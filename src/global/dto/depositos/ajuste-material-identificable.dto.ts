export interface AjusteMaterialIdentificableDTO{
    idajusteexistencia?: number;
    idmaterial: number;
    serial: string;
    disponibilidadanterior?: boolean;
    disponibilidadnueva?: boolean;
    bajaanterior?: boolean;
    bajanueva?: boolean;
}