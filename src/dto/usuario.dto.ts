export interface UsuarioDTO {
    id: number | null;
    nombres: string | null;
    apellidos: string | null;
    razonsocial: string | null;
    ci: string | null;
    password: string | null;
    accesosistema: boolean;
    email: string | null;
    telefono: string | null;
    idrol: number;
    rol: string;
    eliminado: boolean;
}