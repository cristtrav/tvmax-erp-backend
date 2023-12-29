import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({schema: 'sorteos', name: 'vw_sorteos', expression: 'SELECT * FROM sorteos.vw_sorteos'})
export class SorteoView {
    
    @ViewColumn()
    id: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    nroparticipantes: number;

    @ViewColumn()
    nropremios: number;

    @ViewColumn()
    eliminado: boolean;
}