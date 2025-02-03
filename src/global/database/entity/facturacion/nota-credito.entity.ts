import { Schemas } from "@database/meta/schemas";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { NotaCreditoDetalle } from "./nota-credito-detalle.entity";
import { DTE } from "./dte.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { Talonario } from "./talonario.entity";

@Entity({ schema: Schemas.FACTURACION })
export class NotaCredito {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT' })
    id: number;

    @Column({
        name: 'fecha_hora',
        type: 'timestamp with time zone',
        nullable: false,
        default: new Date()
    })
    fechaHora: Date;

    @Column({ name: 'nro_nota', nullable: false })
    nroNota: number;

    @Column({ nullable: false, default: false })
    anulado: boolean;

    @Column({ nullable: false })
    idtalonario: number;

    @Column({ nullable: false })
    idcliente: number;

    @Column({ nullable: false })
    idventa: number;

    @Column({ type: 'numeric', scale: 12, precision: 0, nullable: false, default: '0' })
    total: number;

    @Column({
        name: 'total_gravado_iva10',
        type: 'numeric',
        scale: 10,
        precision: 0,
        nullable: false,
        default: '0'
    })
    totalGravadoIva10: number;

    @Column({
        name: 'total_gravado_iva5',
        type: 'numeric',
        scale: 10,
        precision: 0,
        nullable: false,
        default: '0'
    })
    totalGravadoIva5: number;

    @Column({
        name: 'total_exento_iva',
        type: 'numeric',
        scale: 10,
        precision: 0,
        nullable: false,
        default: '0'
    })
    totalExentoIva: number;

    @Column({
        name: 'total_iva10',
        type: 'numeric',
        scale: 10,
        precision: 0,
        nullable: false,
        default: '0'
    })
    totalIva10: number;

    @Column({
        name: 'total_iva5',
        type: 'numeric',
        scale: 10,
        precision: 0,
        nullable: false,
        default: '0'
    })
    totalIva5: number;

    @Column({ nullable: false })
    iddte: number;

    @Column({ nullable: false, default: false })
    eliminado: boolean;

    @OneToMany(() => NotaCreditoDetalle, (detalles) => detalles.notaCredito)
    detalles: NotaCreditoDetalle[];

    @ManyToOne(() => DTE)
    @JoinColumn({ name: 'iddte' })
    dte: DTE;

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(40, 'Notas de crédito');
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
        evento.idtabla = Talonario.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }
}