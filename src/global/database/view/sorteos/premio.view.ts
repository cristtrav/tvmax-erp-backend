import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({schema: 'sorteos', name: 'vw_premios' ,expression: 'SELECT * FROM sorteos.vw_premios'})
export class PremioView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    nropremio: number;

    @ViewColumn()
    idsorteo: number;

    @ViewColumn()
    sorteo: string;

    @ViewColumn()
    idclienteganador: number;

    @ViewColumn()
    clienteganador: string;

    @ViewColumn()
    ciclienteganador: string;

    @ViewColumn()
    eliminado: boolean;

}