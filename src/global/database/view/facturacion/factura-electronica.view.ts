import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
    name: 'vw_facturas_electronicas',
    schema: 'facturacion',
    expression: 'SELECT * FROM facturacion.vw_facturas_electronicas'
})
export class FacturaElectronicaView{
    
    @ViewColumn()
    idventa: number;

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