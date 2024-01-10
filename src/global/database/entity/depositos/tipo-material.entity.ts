import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: 'depositos'})
export class TipoMaterial {
    @PrimaryColumn()
    id: number;

    @Column({length: 45, nullable: false})
    descripcion: string;

    @Column({name: 'solo_lectura', nullable: false, default: false})
    soloLectura: boolean;

    @Column({nullable: false, default: false})
    eliminado: boolean;
}