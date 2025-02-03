import { Schemas } from "@database/meta/schemas";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NotaCredito } from "./nota-credito.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { Talonario } from "./talonario.entity";

@Entity({schema: Schemas.FACTURACION})
export class NotaCreditoDetalle{

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({name: 'idnota_credito', nullable: false})
    idnotaCredito: number;

    @Column({nullable: false})
    idservicio: number;

    @Column({nullable: false})
    idsuscripcion: number

    @Column({nullable: false})
    idcuota: number;

    @Column({nullable: false, scale: 10, precision: 0, type: 'numeric', default: 0})
    monto: number;

    @Column({nullable: false, scale: 8, precision: 0, type: 'numeric', default: 1})
    cantidad: number;

    @Column({nullable: false, scale: 10, precision: 0, type: 'numeric', default: 0})
    subtotal: number;

    @Column({
        name: 'porcentaje_iva',
        nullable: false,
        scale: 3,
        precision: 0,
        type: 'numeric',
        default: 10
    })
    porcentajeIva: number;

    @Column({
        name: 'monto_iva',
        nullable: false,
        scale: 10,
        precision: 0,
        type: 'numeric',
        default: 0
    })
    montoIva: number;

    @Column({nullable: false, length: 200})
    descripcion: string;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    @ManyToOne(() => NotaCredito, (notaCredito) => notaCredito.detalles)
    @JoinColumn({ name: 'idnota_credito'})
    notaCredito: NotaCredito;

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(41, 'Detalles de notas de crédito');
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