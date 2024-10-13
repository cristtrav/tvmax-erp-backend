import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: "facturacion"})
export class Establecimiento {

    @PrimaryColumn({type: "smallint"})
    id: number;

    @Column({name: "denominacion", length: 60, nullable: false})
    denominacion: string;

    @Column({name: "direccion", length: 150, nullable: false})
    direccion: string;

    @Column({name: "nro_casa", nullable: false})
    nroCasa: number;

    @Column({name: "cod_departamento", nullable: false})
    codDepartamento: number;

    @Column({name: "departamento", length: 60, nullable: false})
    departamento: string;

    @Column({name: "cod_distrito", nullable: false})
    codDistrito: number;

    @Column({name: "distrito", length: 80, nullable: false})
    distrito: string;

    @Column({name: "cod_ciudad", nullable: false})
    codCiudad: number;

    @Column({name: "ciudad", length: 80, nullable: false})
    ciudad: string;

    @Column({name: "telefono", length: 20, nullable: false})
    telefono: string;

    @Column({name: "email", length: 100, nullable: false})
    email: string;
}