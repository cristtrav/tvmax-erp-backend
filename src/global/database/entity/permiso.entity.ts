import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Permiso{

    @PrimaryColumn()
    idfuncionalidad: number;

    @PrimaryColumn()
    idusuario: number;

}