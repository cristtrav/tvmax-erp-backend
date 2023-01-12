import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Servicio{
    @PrimaryColumn()
    id: number;

    @Column({length: 100})
    descripcion: string;

    @Column({precision: 10, scale: 0})
    precio: number;

    @Column({default: true})
    suscribible: boolean;

    @Column({nullable: false})
    idgrupo: number;

    @Column({name: 'porcentaje_iva', precision: 3, scale: 0})
    porcentajeIva: number;

    @Column({default: false})
    eliminado: boolean;
}