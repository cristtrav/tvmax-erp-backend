import { Column, Entity, PrimaryColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { CodigoSeguridadContribuyenteDTO } from "@dto/facturacion/codigo-seguridad-contribuyente.dto";

@Entity({name: 'codigo_seguridad_contribuyente', schema: 'facturacion'})
export class CodigoSeguridadContribuyente {

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(36, 'Actividades Económicas');

    @PrimaryColumn()
    id: number;

    @Column({name: 'codigo_seguridad', length: 200, nullable: false})
    codigoSeguridad: string;

    @Column({name: 'activo', nullable: false, default: true})
    activo: boolean;

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: CodigoSeguridadContribuyente | null,
        newValue: CodigoSeguridadContribuyente | null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = CodigoSeguridadContribuyente.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

    fromDTO(cscDto: CodigoSeguridadContribuyenteDTO): CodigoSeguridadContribuyente{
        this.id = cscDto.id;
        this.codigoSeguridad = cscDto.codigoseguridad;
        this.activo = cscDto.activo;
        return this;
    }

}