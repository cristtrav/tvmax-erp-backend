import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({schema: 'depositos', name: 'vw_materiales', expression: 'SELECT * FROM depositos.vw_materiales'})
export class MaterialView {
    @ViewColumn()
    id: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    unidadmedida: string;

    @ViewColumn()
    sololectura: boolean;

    @ViewColumn()
    idtipomaterial: number;

    @ViewColumn()
    tipomaterial: string;

    @ViewColumn()
    eliminado: boolean;
}