import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ESTADOS_RECLAMOS, EstadoReclamoType } from "./reclamo.entity";

const SCHEMA_NAME = 'reclamos';
const TABLE_NAME = 'evento_cambio_estado'

@Entity({schema: SCHEMA_NAME, name: TABLE_NAME})
export class EventoCambioEstado{

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT' })
    id: number;

    @Column({nullable: false})
    idreclamo: number;

    @Column({type: 'enum', enum: ESTADOS_RECLAMOS, nullable: false})
    estado: EstadoReclamoType;

    @Column({name: 'fecha_hora', type: 'time without time zone', nullable: false})
    fechaHora: Date;

    @Column({length: 60})
    observacion: string;

}