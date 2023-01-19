import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Usuario{

    @PrimaryColumn()
    id: number;

    @Column({length: 80, nullable: false})
    nombres: string;

    @Column({length: 80})
    apellidos: string;

    @Column({length: 10})
    ci: string;

    @Column({length: 120})
    password: string;

    @Column({name: 'acceso_sistema', default: true, nullable: false})
    accesoSistema: boolean;

    @Column({length: 120})
    email: string;

    @Column({length: 20})
    telefono: string;

    @Column({nullable: false})
    idrol: number;

    @Column({default: false, nullable: false})
    eliminado: boolean;
}