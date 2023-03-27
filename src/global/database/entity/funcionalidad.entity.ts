import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Modulo } from "./modulo.entity";
import { Usuario } from "./usuario.entity";

@Entity({
    orderBy: {
        nombre: 'ASC'
    }
})
export class Funcionalidad {

    @PrimaryColumn()
    id: number;

    @Column({ length: 50, nullable: false })
    nombre: string;

    @Column()
    descripcion: string;

    @Column({ nullable: false })
    idmodulo: number;

    @Column({ default: false, nullable: false })
    eliminado: boolean;

    @ManyToOne(() => Modulo, (modulo) => modulo.funcionalidades)
    @JoinColumn({
        name: 'idmodulo'
    })
    modulo: Modulo;

    @ManyToMany(() => Usuario, (usuario) => usuario.permisos)
    @JoinTable({
        name: 'permiso',
        joinColumn: {
            name: 'idfuncionalidad',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'idusuario',
            referencedColumnName: 'id'
        }
    })
    usuarios: Usuario[];

}