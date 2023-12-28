import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Cliente } from "../cliente.entity";

@Entity({schema: 'sorteos'})
export class Sorteo{
    
    @PrimaryColumn()
    id: number;

    @Column({length: 70, nullable: false})
    descripcion: string;

    @Column({default: false, nullable: false})
    eliminado: boolean;

    @ManyToMany(() => Cliente)
    @JoinTable({
        name: 'participante',
        joinColumn: {
            name: 'idsorteo',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'idcliente',
            referencedColumnName: 'id'
        }
    })
    participantes: Cliente[];
}