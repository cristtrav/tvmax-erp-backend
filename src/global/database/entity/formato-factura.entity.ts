import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Timbrado } from "./timbrado.entity";

@Entity()
export class FormatoFactura{

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({nullable: false, length: 45})
    descripcion: string;

    @Column({name: 'tipo_factura', length: 3, nullable: false})
    tipoFactura: 'PRE' | 'AUT' | 'ELEC';

    @Column({length: 6, nullable: false})
    plantilla: 'PRE-A';

    @Column({nullable: false, type: 'json'})
    parametros: {[name: string]: any};

    @Column({default: false, nullable: false})
    eliminado: boolean;

    @OneToMany(() => Timbrado, (timbrado) => timbrado.formato)
    timbrados: Timbrado[];

}