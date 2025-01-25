import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Lote } from "./lote.entity";
import { DTE } from "./dte.entity";

@Entity({name: 'lote_detalle', schema: 'facturacion'})
export class DetalleLote{

    @PrimaryColumn()
    idlote: number

    @PrimaryColumn()
    iddte: number;

    @Column({name: 'codigo_estado', length: 10})
    codigoEstado: string;

    @Column({length: '200'})
    descripcion: string;

    @ManyToOne(() => Lote, (lote) => lote.detallesLote)
    @JoinColumn({name: 'idlote'})
    lote: Lote;

    @ManyToOne(() => DTE)
    @JoinColumn({name: 'iddte'})
    dte: DTE;
}