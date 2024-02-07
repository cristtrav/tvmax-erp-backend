import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { MotivoReclamoDTO } from "@dto/reclamos/motivo.dto";

@Entity({schema: 'reclamos'})
export class Motivo {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({length: 80, nullable: false})
    descripcion: string;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    fromDTO(motivoDto: MotivoReclamoDTO): Motivo{
        this.id = motivoDto.id;
        this.descripcion = motivoDto.descripcion;
        this.eliminado = motivoDto.eliminado;
        return this;
    }

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(28, 'Motivos de Reclamos');

    static getEventoAuditoria(
        idusuario: number, 
        operacion: 'R' | 'M' | 'E',
        oldValue: Motivo | MotivoReclamoDTO | null,
        newValue: Motivo | MotivoReclamoDTO | null): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.fechahora = new Date();
        evento.operacion = operacion;
        evento.idtabla = Motivo.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}