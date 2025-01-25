import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DetalleVenta } from "./detalle-venta.entity";
import { Cliente } from "./cliente.entity";
import { Talonario } from "./facturacion/talonario.entity";

@Entity()
export class Venta {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: "BY DEFAULT" })
    id: number;

    @Column({ default: true, nullable: false })
    pagado: boolean;

    @Column({ default: false, nullable: false })
    anulado: boolean;

    @Column({ name: 'fecha_factura', type: 'date' })
    fechaFactura: Date;

    @Column({name: 'fecha_hora_factura', type: 'timestamp with time zone'})
    fechaHoraFactura: Date;

    @Column({ nullable: false })
    idcliente: number;

    @Column({ name: 'nro_factura', type: 'numeric', scale: 10, precision: 0 })
    nroFactura: number;

    @Column({ nullable: false })
    idtalonario: number;

    @Column({ name: 'idusuario_registro_factura', nullable: false })
    idusuarioRegistroFactura: number;

    @Column({
        name: 'total_exento_iva',
        type: 'numeric',
        scale: 10,
        precision: 0,
        default: 0,
        nullable: false
    })
    totalExentoIva: number;

    @Column({
        name: 'total_gravado_iva10',
        type: 'numeric',
        scale: 10,
        precision: 0,
        default: 0,
        nullable: false
    })
    totalGravadoIva10: number;

    @Column({
        name: 'total_gravado_iva5',
        type: 'numeric',
        scale: 10,
        precision: 0,
        default: 0,
        nullable: false
    })
    totalGravadoIva5: number;

    @Column({
        name: 'total_iva10',
        type: 'numeric',
        scale: 10,
        precision: 0,
        default: 0,
        nullable: false
    })
    totalIva10: number;

    @Column({
        name: 'total_iva5',
        type: 'numeric',
        scale: 10,
        precision: 0,
        default: 0,
        nullable: false
    })
    totalIva5: number;

    @Column({
        type: 'numeric',
        scale: 15,
        precision: 0,
        default: 0,
        nullable: false
    })
    total: number;

    @Column({ default: false, nullable: false })
    eliminado: boolean;

    @Column()
    iddte: number;

    @OneToMany(() => DetalleVenta, (detalle) => detalle.venta)
    detalles: DetalleVenta[];

    @ManyToOne(() => Cliente, (cliente) => cliente.ventas)
    @JoinColumn({ name: 'idcliente' })
    cliente: Cliente;

    @ManyToOne(() => Talonario)
    @JoinColumn({name: 'idtalonario'})
    talonario: Talonario;
}