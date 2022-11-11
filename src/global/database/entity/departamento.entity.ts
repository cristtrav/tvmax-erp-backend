import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Distrito } from "./distrito.entity";

@Entity()
export class Departamento{
    @PrimaryColumn()
    id: string;

    @Column({length: 80})
    descripcion: string;

    @Column({default: false})
    eliminado: boolean;

    @OneToMany(() => Distrito, (distrito) => distrito.departamento)
    distritos: Distrito[];
}