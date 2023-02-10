import { FuncionalidadDTO } from "./funcionalidad.dto"

export class ModuloDTO{
    id: number | null = null;
    descripcion: string | null = null;
    funcionalidades: FuncionalidadDTO[] = [];
}