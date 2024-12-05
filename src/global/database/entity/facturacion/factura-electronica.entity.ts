import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Lote } from "./lote.entity";
import { Venta } from "../venta.entity";

@Entity({schema: "facturacion"})
export class FacturaElectronica {

    @PrimaryColumn()
    idventa: number;

    @Column({name: 'documento_electronico', nullable: false, type: "xml"})
    documentoElectronico: string;

    @Column({name: 'firmado', nullable: false, default: false})
    firmado: boolean;

    @Column({nullable: false})
    version: number;

    @Column({name: 'idestado_documento_sifen', nullable: false})
    idestadoDocumentoSifen: number;

    @Column({name: 'fecha_cambio_estado', type: 'timestamp with time zone', nullable: false})
    fechaCambioEstado: Date;

    @Column({name: 'observacion', type: 'text'})
    observacion: string;

    @Column({name: 'idestado_envio_email', nullable: false})
    idestadoEnvioEmail: number;

    @Column({name: 'fecha_cambio_estado_envio_email', nullable: false, type: 'timestamp with time zone'})
    fechaCambioEstadoEnvioEmaill: Date;

    @Column({name: 'intento_envio_email', nullable: false, default: 0})
    intentoEnvioEmail: number;

    @Column({name: 'observacion_envio_email', type: 'text'})
    observacionEnvioEmail: string;

    @ManyToMany(() => Lote, (lote) => lote.facturas)
    @JoinTable({
        name: 'lote_factura',
        joinColumn: {
            name: 'idventa',
            referencedColumnName: 'idventa'
        },
        inverseJoinColumn: {
            name: 'idlote',
            referencedColumnName: 'id'
        }
    })
    lotes: Lote[];

}