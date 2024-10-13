import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { FormatoFactura } from "./formato-factura.entity";

@Entity()
export class Timbrado{

    @PrimaryColumn()
    id: number;

    @Column({
        name: 'nro_timbrado',
        type: "numeric",
        scale: 8,
        precision: 0,
        nullable: false,
    })
    nroTimbrado: number;

    @Column({
        name: 'cod_establecimiento',
        type: 'numeric',
        scale: 3,
        precision: 0,
        nullable: false
    })
    codEstablecimiento: number;

    @Column({
        name: 'cod_punto_emision',
        type: 'numeric',
        scale: 3,
        precision: 0,
        nullable: false
    })
    codPuntoEmision: number;

    @Column({
        name: 'nro_inicio', 
        type: 'numeric',
        scale: 7,
        precision: 0,
        nullable: false
    })
    nroInicio: number;

    @Column({
        name: 'nro_fin',
        type: 'numeric',
        scale: 7,
        precision: 0,
        nullable: false,
        default: 9999999
    })
    nroFin: number;

    @Column({
        name: 'ultimo_nro_usado',
        type: 'numeric',
        scale: 7,
        precision: 0
    })
    ultimoNroUsado: number;

    @Column({name: 'fecha_inicio_vigencia', type: 'date', nullable: false})
    fechaInicioVigencia: Date;

    @Column({name: 'fecha_vencimiento', type: 'date'})
    fechaVencimiento: Date;

    @Column({nullable: false, default: true})
    activo: boolean;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    @Column({name: 'idformato_factura'})
    idformatoFactura: number;

    @Column({name: 'electronico', nullable: false, default: false})
    electronico: boolean;

    @ManyToOne(() => FormatoFactura, (formato) => formato.timbrados)
    @JoinColumn({
        name: 'idformato_factura'
    })
    formato: FormatoFactura;
}