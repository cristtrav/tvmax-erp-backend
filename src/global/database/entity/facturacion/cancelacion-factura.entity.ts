import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({schema: 'facturacion'})
export class CancelacionFactura {

    @PrimaryColumn({type: 'bigint'})
    id: string;

    @Column({nullable: false})
    idventa: number;

    @Column({name: 'fecha_hora', type: 'timestamp with time zone', default: new Date() , nullable: false})
    fechaHora: Date;

    @Column({name: 'fecha_hora_envio', type: 'timestamp with time zone'})
    fechaHoraEnvio: Date;

    @Column({name: 'envio_correcto', nullable: false, default: false})
    envioCorrecto: boolean;

    @Column({type: 'xml', nullable: false})
    documento: string;

    @Column({type: 'text'})
    observacion: string;

}