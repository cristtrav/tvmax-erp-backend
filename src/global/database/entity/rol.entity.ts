import { Column, Entity, JoinColumn, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Usuario } from "./usuario.entity";

@Entity()
export class Rol{

    @PrimaryColumn()
    id: number;

    @Column({nullable: false, length: 30})
    descripcion: string;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    @Column({name: 'solo_lectura', update: false, default: false})
    soloLectura: boolean;

    @ManyToMany(() => Usuario)
    @JoinTable({
        name: 'rol_usuario',
        joinColumn: {
            name: 'idrol',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'idusuario',
            referencedColumnName: 'id'
        }
    })
    usuarios: Usuario[];

}