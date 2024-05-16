import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { ReiteracionDTO } from "@dto/reclamos/reiteracion.dto";

const SCHEMA_NAME = 'reclamos';

@Entity({schema: SCHEMA_NAME})
export class Reiteracion{

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({nullable: false})
    idreclamo: number;

    @Column({name: 'fecha_hora', nullable: false, type: 'timestamp with time zone'})
    fechaHora: Date;

    @Column({length: 60})
    observacion: string;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(32, 'Reiteracion de Reclamos');

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: Reiteracion | ReiteracionDTO | null,
        newValue: Reiteracion | ReiteracionDTO | null
    ): EventoAuditoria{
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = Reiteracion.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

    fromDTO(reiteracionDto: ReiteracionDTO): Reiteracion{
        if(reiteracionDto.id != null) this.id = reiteracionDto.id;
        this.idreclamo = reiteracionDto.idreclamo;
        this.fechaHora = new Date(reiteracionDto.fechahora);
        this.observacion = reiteracionDto.observacion;
        this.eliminado = reiteracionDto.eliminado;
        return this;
    }

}