import { Schemas } from "@database/meta/schemas";
import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_talonarios'

@ViewEntity({
    name: VIEW_NAME,
    schema: Schemas.FACTURACION,
    expression: `SELECT * FROM ${Schemas.FACTURACION}.${VIEW_NAME}`
})
export class TalonarioView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    codestablecimiento: number;

    @ViewColumn()
    codpuntoemision: number;

    @ViewColumn()
    prefijo: string;

    @ViewColumn()
    nroinicio: number;

    @ViewColumn()
    nrofin: number;

    @ViewColumn()
    fechainicio: string;

    @ViewColumn()
    fechavencimiento: string;

    @ViewColumn()
    nrotimbrado: number;

    @ViewColumn()
    ultimonrousado: number;

    @ViewColumn()
    activo: boolean;

    @ViewColumn()
    idformatofactura: number;

    @ViewColumn()
    electronico: boolean;

    @ViewColumn()
    tipodocumento: string;

    @ViewColumn()
    eliminado: boolean;

}