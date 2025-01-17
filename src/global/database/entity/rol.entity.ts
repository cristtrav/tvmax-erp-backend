import { Column, Entity, JoinColumn, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Usuario } from "./usuario.entity";
import { RolDTO } from "@dto/rol.dto";

@Entity()
export class Rol{

    constructor(rolDto?: RolDTO){
        if(rolDto != null) this.loadDTO(rolDto);
    }

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

    private loadDTO(rolDTO: RolDTO): void {
        this.id = rolDTO.id;
        this.descripcion = rolDTO.descripcion;
        if (rolDTO.eliminado != null) this.eliminado = rolDTO.eliminado;
    }

}