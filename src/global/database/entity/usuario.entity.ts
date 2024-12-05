import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Funcionalidad } from "./funcionalidad.entity";
import { Rol } from "./rol.entity";

@Entity()
export class Usuario {

    public static readonly ID_USUARIO_ADMIN = 2;
    public static readonly ID_USUARIO_SISTEMA = 3;

    @PrimaryColumn()
    id: number;

    @Column({ length: 80, nullable: false })
    nombres: string;

    @Column({ length: 80 })
    apellidos: string;

    @Column({ length: 10 })
    ci: string;

    @Column({ length: 120 })
    password: string;

    @Column({ name: 'acceso_sistema', default: true, nullable: false })
    accesoSistema: boolean;

    @Column({ length: 120 })
    email: string;

    @Column({ length: 20 })
    telefono: string;

    @Column({ default: false, nullable: false })
    eliminado: boolean;

    @Column({ name: 'solo_lectura', update: false, default: false })
    soloLectura: boolean;

    @ManyToMany(() => Funcionalidad, (funcionalidad) => funcionalidad.usuarios, {
        cascade: ['update']
    })
    @JoinTable({
        name: 'permiso',
        joinColumn: {
            name: 'idusuario',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'idfuncionalidad',
            referencedColumnName: 'id'
        }
    })
    permisos: Funcionalidad[];

    @ManyToMany(() => Rol)
    @JoinTable({
        name: 'rol_usuario',
        joinColumn: {
            name: 'idusuario',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'idrol',
            referencedColumnName: 'id'
        }
    })
    roles: Rol[];
}