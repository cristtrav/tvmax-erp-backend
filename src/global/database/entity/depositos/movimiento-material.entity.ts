import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DetalleMovimientoMaterial } from "./detalle-movimiento-material.entity";
import { MovimientoMaterialDTO } from "@dto/depositos/movimiento-material.dto";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";

const TIPOS_MOVIMIENTOS = ['EN', 'SA', 'DE', 'AJ'] as const;
export type TipoMovimientoType = typeof TIPOS_MOVIMIENTOS[number];

@Entity({schema: 'depositos'})
export class MovimientoMaterial {

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(24, 'Movimientos Materiales');

    constructor(movimientoDto?: MovimientoMaterialDTO){
        if(movimientoDto != null) this.fromDTO(movimientoDto);
    }

    @PrimaryGeneratedColumn('identity', { generatedIdentity: "BY DEFAULT" })
    id: number;

    @Column({nullable: false})
    fecha: Date;

    @Column({name: 'idusuario_responsable', nullable: false})
    idusuarioResponsable: number;

    @Column({name: 'idusuario_entrega'})
    idusuarioEntrega: number;

    @Column({name: 'tipo_movimiento', type: 'enum', enum: TIPOS_MOVIMIENTOS, nullable: false})
    tipoMovimiento: TipoMovimientoType;

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

    private fromDTO(m: MovimientoMaterialDTO){
        this.id = m.id;
        this.fecha = m.fecha;
        this.idmovimientoReferencia = m.idmovimientoreferencia;
        this.idusuarioEntrega = m.idusuarioentrega;
        this.idusuarioResponsable = m.idusuarioresponsable;
        this.observacion = m.observacion;
        this.tipoMovimiento = <TipoMovimientoType> m.tipomovimiento
        this.eliminado = false;
        this.devuelto = m.devuelto;
    }

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = MovimientoMaterial.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }
}