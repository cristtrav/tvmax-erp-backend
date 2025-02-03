import { Schemas } from "@database/meta/schemas";
import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_dte';

@ViewEntity({
    name: VIEW_NAME,
    schema: Schemas.FACTURACION,
    expression: `SELECT * FROM ${Schemas.FACTURACION}.${VIEW_NAME}`
})
export class DteView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    tipodocumento: string;

    @ViewColumn()
    firmado: boolean;

    @ViewColumn()
    version: number;

    @ViewColumn()
    idestadodocumento: number;

    @ViewColumn()
    estadodocumento: string;

    @ViewColumn()
    fechacambioestado: string;

    @ViewColumn()
    observaciondocumento: string;

    @ViewColumn()
    idestadoemail: number;

    @ViewColumn()
    estadoemail: string;

    @ViewColumn()
    fechacambioestadoemail: string;

    @ViewColumn()
    intentoemail: number;

    @ViewColumn()
    observacionemail: string;
}