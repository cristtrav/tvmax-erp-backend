import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Lote } from "./lote.entity";
import { FacturaElectronica } from "./factura-electronica.entity";

@Entity({name: 'detalle_lote', schema: 'facturacion'})
export class DetalleLote{

    @PrimaryColumn()
    idlote: number

    @PrimaryColumn()
    idventa: number;

    @Column({name: 'codigo_estado', length: 10})
    codigoEstado: string;

    @Column({length: '200'})
    descripcion: string;

    @ManyToOne(() => Lote, (lote) => lote.detallesLote)
    @JoinColumn({name: 'idlote'})
    lote: Lote;

    @ManyToOne(() => FacturaElectronica)
    @JoinColumn({name: 'idventa'})
    facturaElectronica: FacturaElectronica;
}