export class EventoAuditoria{
    id: number | null = null;
    fechahora: string | null = null;
    idusuario: number | null = null;
    nombresusuario: string | null = null;
    apellidosusuario: string | null = null;
    pkreferencia: string | null = null;
    idtabla: number | null = null;
    tabla: string | null = null;
    operacion: string | null = null;
    estadoanterior: {[name: string]: string | number | null} | null = null;
    estadonuevo: {[name: string]: string | number | null} | null = null;
}