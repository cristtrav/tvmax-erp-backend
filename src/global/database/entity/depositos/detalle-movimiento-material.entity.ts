import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MovimientoMaterial } from "./movimiento-material.entity";
import { DetalleMovimientoMaterialDTO } from "@dto/depositos/detalle-movimiento-material.dto";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { TablaAuditoria } from "../tabla-auditoria.entity";

@Entity({schema: 'depositos'})
export class DetalleMovimientoMaterial{

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(25, 'Detalles de Movimientos de Materiales');

    constructor(detalleDto?: DetalleMovimientoMaterialDTO){
        if(detalleDto) this.fromDTO(detalleDto);
    }

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

    private fromDTO(d: DetalleMovimientoMaterialDTO){
        this.id = d.id;
        this.cantidad = d.cantidad;
        this.cantidadAnterior = d.cantidadanterior;
        this.idmovimientoMaterial = d.idmovimiento;
        this.idmaterial = d.idmaterial;
        this.descripcion = d.descripcion;
        this.iddetalleMovimientoReferencia = d.iddetallemovimientoreferencia;
        this.nroSerieMaterial = d.nroseriematerial;
        this.eliminado = d.eliminado;
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
        evento.idtabla = DetalleMovimientoMaterial.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}