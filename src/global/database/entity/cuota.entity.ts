import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DetalleVenta } from "./detalle-venta.entity";

@Entity()
export class Cuota{

    @PrimaryGeneratedColumn('identity', {generatedIdentity: "BY DEFAULT"})
    id: number;

    @Column({length: 150})
    observacion: string;

    @Column({
        name: 'fecha_vencimiento',
        type: 'date'
    })
    fechaVencimiento: Date;

    @Column({precision: 10, scale: 0})
    monto: number;

    @Column({name: 'nro_cuota',type: 'smallint'})
    nroCuota: number

    @Column({type: 'bigint', nullable: false})
    idsuscripcion: number;

    @Column({default: false})
    eliminado: boolean;

    @Column({type: 'integer'})
    idservicio: number;

    @Column({
        type: 'date',
        name: 'fecha_pago',
    })
    fechaPago: Date;

    @Column({default: false})
    pagado: boolean;

    @Column({name: 'factura_pago'})
    facturaPago: string;

    @OneToMany(() => DetalleVenta, (detalleVenta) => {detalleVenta.cuota})
    detallesVenta: DetalleVenta
}