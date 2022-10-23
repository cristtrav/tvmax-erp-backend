import { Column, Entity, PrimaryColumn } from "typeorm";

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
}