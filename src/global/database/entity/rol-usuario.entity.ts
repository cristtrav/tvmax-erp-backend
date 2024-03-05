import { Entity, PrimaryColumn } from "typeorm";

const SCHEMA_NAME = 'public';

@Entity({schema: SCHEMA_NAME})
export class RolUsuario {

    @PrimaryColumn()
    idusuario: number;

    @PrimaryColumn()
    idrol: number;

}