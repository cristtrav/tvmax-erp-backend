import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Cliente{

    @PrimaryColumn()
    id: number;

    @Column({length: 80})
    nombres: string;

    @Column({length: 80})
    apellidos: string;

    @Column({name: 'razon_social',length: 160, nullable: false})
    razonSocial: string;

    @Column({length: 20})
    telefono1: string;

    @Column({length: 20})
    telefono2: string;

    @Column({length: 120})
    email: string;

    @Column({nullable: false})
    idcobrador: number;

    @Column({length: 15})
    ci: string;

    @Column({name: 'dv_ruc'})
    dvRuc: number;

    @Column({default: false, nullable: false})
    eliminado: boolean;

    @Column({name: 'excluido_sorteo', default: false, nullable: false})
    excluidoSorteo: boolean;
}