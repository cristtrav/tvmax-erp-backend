import { Column, Entity, PrimaryColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { DatoContribuyenteDTO } from "@dto/facturacion/dato-contribuyente.dto";

@Entity({schema: "facturacion"})
export class DatoContribuyente {

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(33, 'Datos del contribuyente');

    public static readonly RUC = "ruc";
    public static readonly RAZON_SOCIAL = "razon-social";

    @PrimaryColumn({name: "clave", length: 50})
    clave: string;

    @Column({name: 'valor', length: 150, nullable: false})
    valor: string;

    fromDTO(dato: DatoContribuyenteDTO): DatoContribuyente{
        this.clave = dato.clave;
        this.valor = dato.valor;
        return this;
    }

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: DatoContribuyente | DatoContribuyenteDTO | null,
        newValue: DatoContribuyente | DatoContribuyenteDTO | null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = DatoContribuyente.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }
}