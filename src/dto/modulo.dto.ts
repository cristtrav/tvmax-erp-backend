import { Funcionalidad } from "./funcionalidad.dto"

export class Modulo{
    id: number | null = null;
    descripcion: string | null = null;
    funcionalidades: Funcionalidad[] = [];
}