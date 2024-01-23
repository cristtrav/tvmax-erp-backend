import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({schema: 'depositos', name: 'vw_usuarios_depositos', expression: 'SELECT * FROM depositos.vw_usuarios_depositos'})
export class UsuarioDepositoView{

    @ViewColumn()
    id: number;

    @ViewColumn()
    razonsocial: string;

    @ViewColumn()
    rol: string;

    @ViewColumn()
    eliminado: boolean;

}