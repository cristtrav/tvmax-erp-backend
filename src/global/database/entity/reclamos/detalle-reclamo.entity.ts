import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { DetalleReclamoDTO } from "@dto/reclamos/detalle-reclamo.dto";

@Entity({schema: 'reclamos'})
export class DetalleReclamo {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({nullable: false})
    idreclamo: number;

    @Column({nullable: false})
    idmotivo: number;

    @Column({length: 150})
    observacion: string;

    @Column({default: false, nullable: false})
    eliminado: boolean;

    fromDTO(detalle: DetalleReclamoDTO): DetalleReclamo{
        this.id = detalle.id;
        this.idreclamo = detalle.idreclamo;
        this.idmotivo = detalle.idmotivo;
        this.observacion = detalle.observacion;
        this.eliminado = detalle.eliminado;
        return this;
    }

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(30, 'Detalles de Reclamos');

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: DetalleReclamo | DetalleReclamoDTO | null,
        newValue: DetalleReclamo | DetalleReclamoDTO | null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = DetalleReclamo.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}