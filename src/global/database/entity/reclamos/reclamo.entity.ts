import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { DetalleReclamo } from "./detalle-reclamo.entity";
import { ReclamoDTO } from "@dto/reclamos/reclamo.dto";

export const ESTADOS_RECLAMOS = ['PEN', 'PRO', 'POS', 'FIN', 'OTR'] as const;
export type EstadoReclamoType = typeof ESTADOS_RECLAMOS[number];

@Entity({schema: 'reclamos'})
export class Reclamo {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({type: 'date', nullable: false})
    fecha: Date;

    @Column({type: 'enum', enum: ESTADOS_RECLAMOS, nullable: false})
    estado: EstadoReclamoType;

    @Column({name: 'fecha_hora_cambio_estado', type: 'timestamp without time zone', nullable: false})
    fechaHoraCambioEstado: Date;

    @Column({name: 'observacion_estado', length: 30})
    observacionEstado: string;

    @Column({name: 'idusuario_registro', nullable: false})
    idusuarioRegistro: number;

    @Column({name: 'idusuario_responsable', nullable: false})
    idusuarioResponsable: number;

    @Column({nullable: false})
    idsuscripcion: number;

    @Column({default: false, nullable: false})
    eliminado: boolean;

    @Column({length: 100})
    observacion: string;

    @Column({length: 20, nullable: false})
    telefono: string;

    @Column({name: 'motivo_postergacion', length: 60})
    motivoPostergacion: string;

    @Column({name: 'motivo_reiteracion', length: 60})
    motivoReiteracion: string;

    @Column({name: 'persona_recepcion_tecnico', length: 50})
    personaRecepcionTecnico: string;

    @OneToMany(() => DetalleReclamo, (detalle) => detalle.reclamo)
    detalles: DetalleReclamo[];

    fromDTO(reclamoDto: ReclamoDTO): Reclamo {
        this.id = reclamoDto.id;
        this.fecha = reclamoDto.fecha;
        this.estado = <EstadoReclamoType>reclamoDto.estado;
        this.fechaHoraCambioEstado = reclamoDto.fechahoracambioestado;
        this.observacionEstado = reclamoDto.observacionestado;
        this.idusuarioRegistro = reclamoDto.idusuarioregistro;
        this.idusuarioResponsable = reclamoDto.idusuarioresponsable
        this.idsuscripcion = reclamoDto.idsuscripcion;
        this.eliminado = reclamoDto.eliminado;
        this.observacion = reclamoDto.observacion;
        this.telefono = reclamoDto.telefono;
        this.motivoPostergacion = reclamoDto.motivopostergacion;
        this.motivoReiteracion = reclamoDto.motivoreiteracion;
        this.personaRecepcionTecnico = reclamoDto.personarecepciontecnico;
        return this;
    }

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(29, 'Reclamos');

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: Reclamo | ReclamoDTO | null,
        newValue: Reclamo | ReclamoDTO | null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = Reclamo.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}