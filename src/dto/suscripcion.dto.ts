export class SuscripcionDTO{
    id: number | null = null;
    idservicio: number | null = null;
    servicio: string | null = null;
    idgrupo: number | null = null;
    grupo: string | null = null;
    estado: string | null = null;
    fechacambioestado: string | null = null;
    fechasuscripcion: string | null = null;
    iddomicilio: number | null = null;
    direccion: string | null = null;
    idbarrio: number | null = null;
    barrio: string | null = null;
    iddistrito: number | null = null;
    distrito: string | null = null;
    iddepartamento: number | null = null;
    departamento: string | null = null;
    idcliente: number | null = null;
    cliente: string | null = null;
    ci: string | number | null = null;
    dvruc: number | null = null;
    monto: number| null = null;
    cuotaspendientes: number = 0;
    deuda: number = 0; 
    eliminado: boolean | null = false;
}