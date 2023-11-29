import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DetalleMovimientoMaterial } from "./detalle-movimiento-material.entity";

@Entity({schema: 'depositos'})
export class MovimientoMaterial {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: "BY DEFAULT" })
    id: number;

    @Column({nullable: false})
    fecha: Date;

    @Column({name: 'idusuario_responsable', nullable: false})
    idusuarioResponsable: number;

    @Column({name: 'idusuario_entrega'})
    idusuarioEntrega: number;

    @Column({name: 'tipo_movimiento', length: 2, nullable: false})
    tipoMovimiento: string;

    @Column({name: 'idmovimiento_referencia'})
    idmovimientoReferencia: number;

    @Column({length: 150})
    observacion: string;

    @Column({nullable: false, default: false})
    devuelto: boolean;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    @OneToMany(() => DetalleMovimientoMaterial, detalle => detalle.movimiento)
    detalles: DetalleMovimientoMaterial[]
}