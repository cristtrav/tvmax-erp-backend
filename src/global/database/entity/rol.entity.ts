import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Rol{

    @PrimaryColumn()
    id: number;

    @Column({nullable: false, length: 30})
    descripcion: string;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    @Column({name: 'solo_lectura', update: false, default: false})
    soloLectura: boolean;

}