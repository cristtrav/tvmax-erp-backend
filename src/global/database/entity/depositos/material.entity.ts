import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: 'depositos'})
export class Material{
    @PrimaryColumn()
    id: number;
    
    @Column({length: 80, nullable: false})
    descripcion: string;

    @Column({name: 'unidad_medida', length: 2, nullable: false})
    unidadMedida: string;

    @Column({name: 'idtipo_material', nullable: false})
    idtipoMaterial: number;

    @Column({name: 'solo_lectura', nullable: false, default: false})
    soloLectura: boolean;

    @Column({nullable: false, default: false})
    identificable: boolean;

    @Column({nullable: false, default: false})
    eliminado: boolean;
}