import { Column, Entity, PrimaryColumn } from "typeorm";

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

}