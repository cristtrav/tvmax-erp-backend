import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: 'depositos'})
export class MaterialIdentificable {

    @PrimaryColumn({length: 70})
    serial: string;

    @PrimaryColumn()
    idmaterial: number

    @Column({nullable: false, default: false})
    disponible: boolean;

    @Column({nullable: false, default: false})
    eliminado: boolean;

}