import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Sesion{

    @PrimaryColumn()
    token: string;

    @Column({nullable: false})
    idusuario: number;

    @Column({name: 'fecha_hora', type: 'timestamp without time zone'})
    fechaHora: Date;

    @Column({length: 150})
    dispositivo: string;
    
}