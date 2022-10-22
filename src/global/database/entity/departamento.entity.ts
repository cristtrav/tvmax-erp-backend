import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Departamento{
    @PrimaryColumn()
    id: string;
    @Column({length: 80})
    descripcion: string;
    @Column({default: false})
    eliminado: boolean;
}