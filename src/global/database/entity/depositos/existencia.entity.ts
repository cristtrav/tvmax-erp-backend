import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: 'depositos'})
export class Existencia{
    @PrimaryColumn()
    idmaterial: number;

    @PrimaryColumn()
    iddeposito: number;

    @Column({nullable: false, type: 'numeric', scale: 9, precision: 2, default: 0})
    cantidad: string;
}