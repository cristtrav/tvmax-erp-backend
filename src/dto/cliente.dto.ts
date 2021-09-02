export class Cliente {
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
    cantconectados: number = 0;
    cantdesconectados: number = 0;
}