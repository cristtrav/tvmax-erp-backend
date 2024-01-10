import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
    schema: 'depositos',
    name: 'vw_movimientos_materiales',
    expression: 'SELECT * FROM vw_movimientos_materiales'
})
export class MovimientoMaterialView{
    
    @ViewColumn()
    id: number;

    @ViewColumn()
    fecha: Date;

    @ViewColumn()
    fecharetiro: Date;

    @ViewColumn()
    tipomovimiento: string;

    @ViewColumn()
    idusuarioresponsable: number;

    @ViewColumn()
    usuarioresponsable: string;

    @ViewColumn()
    idusuarioentrega: number;

    @ViewColumn()
    usuarioentrega: string;

    @ViewColumn()
    idmovimientoreferencia: number;

    @ViewColumn()
    observacion: string;

    @ViewColumn()
    devuelto: boolean;

    @ViewColumn()
    eliminado: boolean;
}