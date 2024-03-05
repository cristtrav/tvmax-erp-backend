import { RolDTO } from "./rol.dto";

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
    roles?: RolDTO[];
    idroles?: number[];
    eliminado: boolean;
    sololectura: boolean;
}