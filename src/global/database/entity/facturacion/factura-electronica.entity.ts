import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { DetalleLote } from "./detalle-lote.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { TablaAuditoria } from "../tabla-auditoria.entity";

@Entity({schema: "facturacion"})
export class FacturaElectronica {

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(38, 'Factura Electrónica');

    @PrimaryColumn()
    idventa: number;

    @Column({name: 'documento_electronico', nullable: false, type: "xml"})
    documentoElectronico: string;

    @Column({name: 'firmado', nullable: false, default: false})
    firmado: boolean;

    @Column({nullable: false})
    version: number;

    @Column({name: 'idestado_documento_sifen', nullable: false})
    idestadoDocumentoSifen: number;

    @Column({name: 'fecha_cambio_estado', type: 'timestamp with time zone', nullable: false})
    fechaCambioEstado: Date;

    @Column({name: 'observacion', type: 'text'})
    observacion: string;

    @Column({name: 'idestado_envio_email', nullable: false})
    idestadoEnvioEmail: number;

    @Column({name: 'fecha_cambio_estado_envio_email', nullable: false, type: 'timestamp with time zone'})
    fechaCambioEstadoEnvioEmaill: Date;

    @Column({name: 'intento_envio_email', nullable: false, default: 0})
    intentoEnvioEmail: number;

    @Column({name: 'observacion_envio_email', type: 'text'})
    observacionEnvioEmail: string;

    @OneToMany(() => DetalleLote, (DetalleLote) => DetalleLote.facturaElectronica)
    detallesLote: DetalleLote[];

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: FacturaElectronica | null,
        newValue: FacturaElectronica | null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = FacturaElectronica.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}