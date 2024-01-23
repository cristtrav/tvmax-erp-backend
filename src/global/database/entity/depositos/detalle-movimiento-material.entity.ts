import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MovimientoMaterial } from "./movimiento-material.entity";

@Entity({schema: 'depositos'})
export class DetalleMovimientoMaterial{

    @PrimaryGeneratedColumn('identity', {generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({name: 'idmovimiento_material', nullable: false})
    idmovimientoMaterial: number;

    @Column({nullable: false})
    idmaterial: number;

    @Column({nullable: false, type: 'numeric', scale: 9, precision: 2, default: 0})
    cantidad: string;

    @Column({
        name: 'cantidad_anterior',
        nullable: false,
        type: 'numeric',
        scale: 9,
        precision: 2,
        default: 0
    })
    cantidadAnterior: string;

    @Column({length: 150})
    descripcion: string;
    
    @Column({name: 'iddetalle_movimiento_referencia'})
    iddetalleMovimientoReferencia: number;

    @Column({name: 'nro_serie_material', length: 70})
    nroSerieMaterial: string;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    @ManyToOne(() => MovimientoMaterial, (movimiento) => movimiento.detalles)
    @JoinColumn({name: 'idmovimiento_material'})
    movimiento: MovimientoMaterial;

}