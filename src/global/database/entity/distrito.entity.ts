import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Departamento } from "./departamento.entity";

@Entity()
export class Distrito{
    @PrimaryColumn()
    id: string;

    @Column({length: 150})
    descripcion: string;

    @Column({length: 2})
    iddepartamento: string;

    @Column({default: false})
    eliminado: boolean;

    @ManyToOne(()=>Departamento, (departamento)=>departamento.distritos)
    @JoinColumn({name: 'iddepartamento'})
    departamento: Departamento;
}