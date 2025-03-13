export class ClienteDTO {
    id: number | null = null;
    nombres: string | null = null;
    apellidos: string | null = null;
    razonsocial: string | null = null;
    telefono1: string | null = null;
    telefono2: string | null = null;
    email: string | null = null;
    ci: string | null = null;
    dvruc: number | null = null;
    idcobrador: number | null = null;
    cobrador: string | null = null;
    iddomicilio: number | null = null;
    direccion: string | null = null;
    idbarrio: number | null = null;
    barrio: string | null = null;
    iddistrito: string | null = null;
    distrito: string | null = null;
    iddepartamento: string | null = null;
    departamento: string | null = null;
    cantconectados: number = 0;
    cantdesconectados: number = 0;
    excluidosorteo: boolean = false;
    eliminado: boolean | null = false;
    latitud: number | null = null;
    longitud: number | null = null;
    idtipocliente: number | null = null;
}