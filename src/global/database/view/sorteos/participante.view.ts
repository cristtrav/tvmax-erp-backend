import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({schema: 'sorteos', name: 'vw_participantes', expression: 'SELECT * FROM sorteos.vw_participantes'})
export class ParticipanteView{
    
    @ViewColumn()
    idsorteo: number;

    @ViewColumn()
    sorteo: string;

    @ViewColumn()
    idcliente: number;

    @ViewColumn()
    cliente: string;

    @ViewColumn()
    ci: number;

}