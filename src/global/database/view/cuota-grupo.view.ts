import { Schemas } from "@database/meta/schemas";
import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_cuotas_grupos'

@ViewEntity({schema: Schemas.PUBLIC, name: VIEW_NAME, expression: `SELECT * FROM ${Schemas.PUBLIC}.${VIEW_NAME}`})
export class CuotaGrupoView {

    @ViewColumn()
    codigo: string;
    
    @ViewColumn()
    idsuscripcion: number;
     
    @ViewColumn()
    idservicio: number;

    @ViewColumn()
    totalcuotas: number;

    @ViewColumn()
    activo: boolean;

}