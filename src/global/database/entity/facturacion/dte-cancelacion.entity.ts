import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({schema: 'facturacion', name: 'dte_cancelacion'})
export class DTECancelacion {

    @PrimaryColumn({type: 'bigint'})
    id: string;

    @Column({nullable: false})
    iddte: number;

    @Column({name: 'fecha_hora', type: 'timestamp with time zone', default: new Date() , nullable: false})
    fechaHora: Date;

    @Column({name: 'fecha_hora_envio', type: 'timestamp with time zone'})
    fechaHoraEnvio: Date;

    @Column({name: 'envio_correcto', nullable: false, default: false})
    envioCorrecto: boolean;

    @Column({type: 'xml', nullable: false})
    xml: string;

    @Column({type: 'text'})
    observacion: string;

}