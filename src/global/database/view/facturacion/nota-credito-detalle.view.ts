import { Schemas } from "@database/meta/schemas";
import { ViewColumn, ViewEntity } from "typeorm";

const VIEW_NAME = 'vw_notas_credito_detalles';

@ViewEntity({
    schema: Schemas.FACTURACION,
    name: VIEW_NAME,
    expression: `SELECT * FROM ${Schemas.FACTURACION}.${VIEW_NAME}`
})
export class NotaCreditoDetalleView {
    
    @ViewColumn()
    id: number;

    @ViewColumn()
    idnotacredito: number;

    @ViewColumn()
    idservicio: number;

    @ViewColumn()
    idsuscripcion: number;

    @ViewColumn()
    idcuota: number;

    @ViewColumn()
    monto: number;

    @ViewColumn()
    cantidad: number;

    @ViewColumn()
    subtotal: number;

    @ViewColumn()
    porcentajeiva: number;

    @ViewColumn()
    montoiva: number;

    @ViewColumn()
    descripcion: string;

    @ViewColumn()
    eliminado: boolean;

}