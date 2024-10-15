import { ActividadEconomicaDTO } from "@dto/facturacion/actividad-economica.dto";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { TablaAuditoria } from "../tabla-auditoria.entity";

@Entity({schema: "facturacion"})
export class ActividadEconomica{
    
    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(34, 'Actividades Económicas');

    @PrimaryColumn()
    id: number;

    @Column({length: 150, nullable: false})
    descripcion: string;

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: ActividadEconomica | ActividadEconomicaDTO | null,
        newValue: ActividadEconomica | ActividadEconomicaDTO | null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = ActividadEconomica.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

    fromDTO(actividadDto: ActividadEconomicaDTO): ActividadEconomica{
        this.id = actividadDto.id;
        this.descripcion = actividadDto.descripcion;
        return this;
    }
}