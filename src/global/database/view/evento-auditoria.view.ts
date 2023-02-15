import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_eventos_auditoria', expression: 'SELECT * FROM public.vw_eventos_auditoria'})
export class EventoAuditoriaView{

    @ViewColumn()
    id: string;

    @ViewColumn()
    fechahora: Date;

    @ViewColumn()
    idusuario: number;

    @ViewColumn()
    nombresusuario: string;

    @ViewColumn()
    apellidosusuario: string;

    @ViewColumn()
    idtabla: number;

    @ViewColumn()
    tabla: string;

    @ViewColumn()
    operacion: string;

    @ViewColumn()
    estadoanterior: {[name: string]: any}

    @ViewColumn()
    estadonuevo: {[name: string]: any}
}