import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ConsultaCobranzaExterna } from "./consulta-cobranza-externa.entity";

@Entity()
export class DetalleConsultaCobranzaExterna{

    @PrimaryGeneratedColumn('identity', {generatedIdentity: 'BY DEFAULT', name: 'nro_operacion'})
    nroOperacion: number;

    @Column({name: 'des_operacion', length: 100, nullable: false})
    desOperacion: string;

    @Column({name: 'nro_cuota', type: 'numeric', precision: 3, scale: 0})
    nroCuota: number;

    @Column({name: 'total_detalle', type: 'numeric', precision: 15, scale: 2, nullable: false, default: 0})
    totalDetalle: number;

    @Column({name: 'iva_10', type: 'numeric', precision: 15, scale: 2, nullable: false, default: 0})
    iva10: number;

    @Column({name: 'iva_5', type: 'numeric', precision: 15, scale: 2, nullable: false, default: 0})
    iva5: number;

    @Column({name: 'fecha_vencimiento', length: '8'})
    fechaVencimiento: string;

    @Column({name: 'idconsulta_cobranza_externa', nullable: false})
    idconsultaCobranzaExterna: number;

    @Column({name: 'cod_transaccion_pago', type: 'bigint'})
    codTransaccionPago: number;

    @Column({name: 'cod_transaccion_anulacion', type: 'bigint'})
    codTransaccionAnulacion: number;

    @Column({name: 'direccion_domicilio', length: 100})
    direccionDomicilio: string;

    @Column()
    idcuota: number;

    @ManyToOne(() => ConsultaCobranzaExterna, (consulta) => consulta.detalles)
    @JoinColumn({name: 'idconsulta_cobranza_externa'})
    consulta: ConsultaCobranzaExterna;
}