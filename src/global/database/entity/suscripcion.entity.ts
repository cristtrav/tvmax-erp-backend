import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Suscripcion{

    @PrimaryColumn()
    id: number;

    @Column({scale: 9, precision: 0, nullable: false})
    monto: number;

    @Column({name: 'fecha_suscripcion', nullable: false})
    fechaSuscripcion: Date;

    @Column({nullable: false})
    idcliente: number;

    @Column({nullable: false})
    iddomicilio: number;

    @Column({nullable: false})
    idservicio: number;

    @Column({nullable: false, length: 1})
    estado: string;

    @Column({name: 'fecha_cambio_estado', nullable: false})
    fechaCambioEstado: Date;

    @Column({default: false, nullable: false})
    eliminado: boolean;

    @Column({default: false, nullable: false})
    gentileza: boolean;

}