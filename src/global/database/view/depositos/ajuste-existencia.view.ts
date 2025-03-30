import { Schemas } from "@database/meta/schemas";
import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_ajustes_existencias'

@ViewEntity({
    schema: Schemas.DEPOSITOS,
    name: VIEW_NAME,
    expression: `SELECT * FROM ${Schemas.DEPOSITOS}.${VIEW_NAME}`
})
export class AjusteExistenciaView {
    @ViewColumn()
    id: number;

    @ViewColumn()
    fechahora: string;

    @ViewColumn()
    idmaterial: number;

    @ViewColumn()
    material: string;

    @ViewColumn()
    unidadmedida: string;

    @ViewColumn()
    cantidadanterior: string;

    @ViewColumn()
    cantidadnueva: string;

    @ViewColumn()
    idusuario: number;

    @ViewColumn()
    usuario: string;

    @ViewColumn()
    ultimoid: boolean;

    @ViewColumn()
    eliminado: boolean;
}