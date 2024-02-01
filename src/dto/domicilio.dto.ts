export class DomicilioDTO {
    id: number | null = null;
    direccion: string | null = null;
    nromedidor: string | null = null;
    idbarrio: number | null = null;
    barrio: string | null = null;
    idcliente: number | null = null;
    cliente: string | null = null;
    observacion: string | null = null;
    principal: boolean = false;
    iddistrito: number | null = null;
    distrito: string | null = null;
    iddepartamento: number | null = null;
    departamento: string| null = null;
    tipo: string | null = null;
    latitud: number | null = null;
    longitud: number | null = null;
    eliminado: boolean | null = null;
}