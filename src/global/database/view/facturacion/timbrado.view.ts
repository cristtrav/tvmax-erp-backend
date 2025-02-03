import { Schemas } from "@database/meta/schemas";
import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_timbrados'

@ViewEntity({
    schema: Schemas.FACTURACION,
    name: VIEW_NAME,
    expression: `SELECT * FROM ${Schemas.FACTURACION}.${VIEW_NAME}`
})
export class TimbradoView{

    @ViewColumn()
    nrotimbrado: number;

    @ViewColumn()
    fechainiciovigencia: string;

    @ViewColumn()
    fechavencimiento: string;

    @ViewColumn()
    electronico: boolean;

    @ViewColumn()
    activo: boolean;

    @ViewColumn()
    nrotalonarios: number;

    @ViewColumn()
    eliminado: boolean;

}