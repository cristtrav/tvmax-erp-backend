import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cobro {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT' })
    id: number;

    @Column({ nullable: false })
    idventa: number;

    @Column({ nullable: false })
    fecha: Date;

    @Column({ name: 'cobrado_por', nullable: false })
    cobradoPor: number;

    @Column({ default: false, nullable: false })
    anulado: boolean;

    @Column({ name: 'nro_recibo', nullable: false })
    nroRecibo: string;

    @Column({ name: 'comision_para', nullable: false })
    comisionPara: number

    @Column({ default: false, nullable: false })
    eliminado: boolean;

}