import { Schemas } from "@database/meta/schemas";
import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_ajustes_materiales_identificables'

@ViewEntity({
    schema: Schemas.DEPOSITOS,
    name: VIEW_NAME,
    expression: `SELECT * FROM ${Schemas.DEPOSITOS}.${VIEW_NAME}`
})
export class AjusteMaterialIdentificableView {

    @ViewColumn()
    idajusteexistencia: number;

    @ViewColumn()
    idmaterial: number;

    @ViewColumn()
    serial: string;

    @ViewColumn()
    disponibilidadanterior: boolean;

    @ViewColumn()
    disponibilidadnueva: boolean;

    @ViewColumn()
    bajaanterior: boolean;

    @ViewColumn()
    bajanueva: boolean;

}