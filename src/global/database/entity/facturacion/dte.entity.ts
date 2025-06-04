import { Column, Entity, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { DetalleLote } from "./lote-detalle.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { TIPO_DOCUMENTO, TipoDocumentoType } from "@database/types/facturacion/tipo-documento.type";
import { Venta } from "../venta.entity";

@Entity({schema: "facturacion", name: 'dte'})
export class DTE {

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(38, 'Documento Tributario Electrónico (DTE)');

    @PrimaryGeneratedColumn('identity', {generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({name: 'xml', nullable: false, type: "xml"})
    xml: string;

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

    @Column({name: 'tipo_documento', nullable: false, type: 'enum', enum: TIPO_DOCUMENTO})
    tipoDocumento: TipoDocumentoType;

    @OneToMany(() => DetalleLote, (DetalleLote) => DetalleLote.dte)
    detallesLote: DetalleLote[];

    @OneToOne(() => Venta, (venta) => venta.dte)
    venta: Venta;

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: DTE | null,
        newValue: DTE | null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = DTE.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}