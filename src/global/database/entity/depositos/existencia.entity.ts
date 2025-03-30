import { Column, Entity, PrimaryColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { Schemas } from "@database/meta/schemas";

@Entity({ schema: Schemas.DEPOSITOS })
export class Existencia{

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(26, 'Existencias de Materiales');

    @PrimaryColumn()
    idmaterial: number;

    @PrimaryColumn()
    iddeposito: number;

    @Column({nullable: false, type: 'numeric', scale: 9, precision: 2, default: 0})
    cantidad: string;

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
        evento.idtabla = Existencia.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }
}