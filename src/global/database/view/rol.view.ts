import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({name: 'vw_rol', expression: 'SELECT * FROM vw_rol'})
export class RolView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    sololectura: boolean;

    @ViewColumn()
    eliminado: boolean;

}