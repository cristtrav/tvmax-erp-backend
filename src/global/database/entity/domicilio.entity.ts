import { Column, Entity, PrimaryColumn } from "typeorm";

const pointTransformer = {
    from: value => {
        if(value == null) return null;
        return value;
    },
    to: value => {
        if(value == null) return null;
        return `${value.x},${value.y}`;
    }
}

@Entity()
export class Domicilio{

    @PrimaryColumn()
    id: number;

    @Column({length: 200, nullable: false})
    direccion: string;

    @Column({name: 'nro_medidor', length: 30})
    nroMedidor: string;

    @Column({nullable: false})
    idbarrio: number;

    @Column({length: 150})
    observacion: string;

    @Column({nullable: false})
    idcliente: number;

    @Column({nullable: false, default: false})
    principal: boolean;

    @Column({nullable: false, length: 3})
    tipo: string;

    @Column({
        type: 'point',
        transformer: pointTransformer
    })
    ubicacion: PointType

    @Column({nullable: false, default: false})
    eliminado: boolean;
}

type PointType = {
    x: number,
    y: number
}