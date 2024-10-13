export class TimbradoDTO {
    id: number | null = null;
    codestablecimiento: number | null = null;
    codpuntoemision: number | null = null;
    nroinicio: number | null = null;
    nrofin: number | null = null;
    nrotimbrado: number | null = null;
    fechainicio: string | null = null;
    fechavencimiento: string | null = null;
    ultnrousado: number | null = null;
    activo: boolean | null = true;
    idformatofactura: number | null = null;
    electronico: boolean = false;
}