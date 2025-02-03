import { Schemas } from "@database/meta/schemas";
import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_notas_credito';

@ViewEntity({
    schema: Schemas.FACTURACION,
    name: VIEW_NAME,
    expression: `SELECT * FROM ${Schemas.FACTURACION}.${VIEW_NAME}`
})
export class NotaCreditoView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    prefijonota: string;

    @ViewColumn()
    fechahora: string;

    @ViewColumn()
    nronota: number;

    @ViewColumn()
    anulado: boolean;

    @ViewColumn()
    idtalonario: number;

    @ViewColumn()
    idcliente: number;

    @ViewColumn()
    razonsocial: string;

    @ViewColumn()
    ci: string;

    @ViewColumn()
    dvruc: number;

    @ViewColumn()
    idventa: number;

    @ViewColumn()
    total: number;

    @ViewColumn()
    totalgravadoiva10: number;

    @ViewColumn()
    totalgravadoiva5: number;

    @ViewColumn()
    totalexentoiva: number;

    @ViewColumn()
    totaliva10: number;

    @ViewColumn()
    totaliva5: number;

    @ViewColumn()
    iddte: number;

    @ViewColumn()
    idestadodte: number;

    @ViewColumn()
    nrofactura: string;

    @ViewColumn()
    eliminado: boolean;

}