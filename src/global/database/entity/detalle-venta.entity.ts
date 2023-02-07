import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cuota } from "./cuota.entity";
import { Venta } from "./venta.entity";

@Entity()
export class DetalleVenta {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT' })
    id: number;

    @Column()
    idventa: number;

    @Column({type: 'numeric', scale: 10, precision: 0, default: 0, nullable: false})
    monto: number;

    @Column({type: 'numeric', scale: 8, precision: 0, default: 1, nullable: false})
    cantidad: number;

    @Column({type: 'numeric', scale: 10, precision: 0, default: 0, nullable: false})
    subtotal: number;

    @Column({nullable: false})
    idservicio: number;

    @Column({name: 'porcentaje_iva',type: 'numeric', default: 10, scale: 3, precision: 0})
    porcentajeIva: number;

    @Column()
    idcuota: number;

    @Column({length: 150, nullable: false})
    descripcion: string;

    @Column({nullable: false})
    idsuscripcion: number;

    @Column({name: 'monto_iva', default: 0, nullable: false})
    montoIva: number;

    @Column({default: false, nullable: false})
    eliminado: boolean;

    @ManyToOne(()=> Venta, (venta) => {venta.detalles})
    @JoinColumn({name: 'idventa'})
    venta: Venta;

    @ManyToOne(() => Cuota, (cuota) => { cuota.detallesVenta })
    @JoinColumn({name: 'idcuota'})
    cuota: Cuota;
}