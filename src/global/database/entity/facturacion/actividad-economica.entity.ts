import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: "facturacion"})
export class ActividadEconomica{
    @PrimaryColumn()
    id: number;

    @Column({length: 150, nullable: false})
    descripcion: string;
}