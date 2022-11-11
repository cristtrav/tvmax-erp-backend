import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Grupo{
    @PrimaryColumn()
    id: number;

    @Column({length: 80})
    descripcion: string;

    @Column({default: false})
    eliminado: boolean;
}