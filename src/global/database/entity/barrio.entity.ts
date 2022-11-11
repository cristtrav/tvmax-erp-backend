import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Barrio{
    @PrimaryColumn()
    id: number;

    @Column({length: 150})
    descripcion: string;

    @Column({length: 4})
    iddistrito: string;

    @Column({default: false})
    eliminado: boolean;
}