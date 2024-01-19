import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
    schema: 'depositos',
    name: 'vw_detalles_movimientos_materiales',
    expression: 'SELECT * FROM vw_detalles_movimientos_materiales'
})
export class DetalleMovimientoMaterialView {

    @ViewColumn()
    id: number;

    @ViewColumn()
    idmovimientomaterial: number;

    @ViewColumn()
    idmaterial: number;

    @ViewColumn()
    material: string;

    @ViewColumn()
    unidadmedida: string;

    @ViewColumn()
    materialidentificable: boolean;

    @ViewColumn()
    cantidad: string;

    @ViewColumn()
    cantidadanterior: string;

    @ViewColumn()
    cantidadretirada: string;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    nroseriematerial: string;

    @ViewColumn()
    eliminado: boolean;

}