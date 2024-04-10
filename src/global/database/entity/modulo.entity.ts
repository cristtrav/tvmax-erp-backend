import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Funcionalidad } from "./funcionalidad.entity";

@Entity()
export class Modulo {

    @PrimaryColumn()
    id: number;

    @Column({ length: 80, nullable: false })
    descripcion: string;

    @Column({ default: false, nullable: false })
    eliminado: boolean;

    @OneToMany(() => Funcionalidad, (funcionalidad) => funcionalidad.modulo)
    funcionalidades: Funcionalidad[];

}