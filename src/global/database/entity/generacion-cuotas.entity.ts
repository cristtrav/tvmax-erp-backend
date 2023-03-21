import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GeneracionCuotas{

    @PrimaryGeneratedColumn('identity', {generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({name: 'fecha_hora_inicio', type: 'timestamp without time zone', nullable: false, default: new Date()})
    fechaHoraInicio: Date;

    @Column({name: 'fecha_hora_fin', type: 'time without time zone'})
    fechaHoraFin: Date;

    @Column({name: 'cantidad_cuotas', default: 0, nullable: false})
    cantidadCuotas: number;

    @Column({name: 'cantidad_cuotas_omitidas', default: 0, nullable: false})
    cantidadCuotasOmitidas: number;
}