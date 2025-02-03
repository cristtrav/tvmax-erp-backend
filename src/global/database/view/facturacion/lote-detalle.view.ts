import { Schemas } from "@database/meta/schemas";
import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_lotes_detalles';

@ViewEntity({name: VIEW_NAME, schema: Schemas.FACTURACION, expression: `SELECT * FROM ${Schemas.FACTURACION}.${VIEW_NAME}`})
export class LoteDetalleView{
    
    @ViewColumn()
    iddte: number;

    @ViewColumn()
    idlote: number;

    @ViewColumn()
    tipodocumento: string;

    @ViewColumn()
    codigoestado: string;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    nrotimbrado: number;

    @ViewColumn()
    nrodocumento: number;

    @ViewColumn()
    iddocumento: number;

    @ViewColumn()
    fechadocumento: string;
}