import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: 'sorteos'})
export class Premio{

    @PrimaryColumn()
    id: number;

    @Column({length: 100, nullable: false})
    descripcion: string;

    @Column()
    nro_premio: number;

    @Column({nullable: false})
    idsorteo: number;

    @Column({name: 'idcliente_ganador', nullable: false})
    idclienteGanador: number;

    @Column({nullable: false, default: false})
    eliminado: boolean;

}