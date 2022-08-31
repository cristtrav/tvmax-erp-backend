export interface Funcionario {
    id: number | null;
    nombres: string | null;
    apellidos: string | null;
    razonsocial: string | null;
    ci: string | null;
    dvruc: number | null;
    password: string | null;
    activo: boolean;
    email: string | null;
    telefono: string | null;
    escobrador: boolean;
    esusuario: boolean;
    eliminado: boolean;
}