import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { FacturaElectronica } from "./factura-electronica.entity";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";

@Entity({schema: 'facturacion'})
export class Lote {

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(37, 'Lote SIFEN');

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({
        name: 'fecha_hora_creacion',
        nullable: false,
        type: 'time with time zone',
        default: new Date()
    })
    fechaHoraCreacion: Date;

    @Column({name: 'fecha_hora_consulta', type: 'time with time zone'})
    fechaHoraConsulta: Date;

    @Column({name: 'fecha_hora_envio', type: 'timestamp with time zone'})
    fechaHoraEnvio: Date;

    @Column({nullable: false, default: false})
    enviado: boolean;

    @Column({nullable: false, default: false})
    aceptado: boolean;

    @Column({nullable: false, default: false})
    consultado: boolean;

    @Column({name: 'nro_lote_sifen',length: 20})
    nroLoteSifen: string;
    
    @Column({type: 'text'})
    observacion: string;
    

    @ManyToMany(() => FacturaElectronica, (factura) => factura.lotes)
    @JoinTable({
        name: 'lote_factura',
        joinColumn: {
            name: 'idlote',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'idventa',
            referencedColumnName: 'idventa'
        }
    })
    facturas: FacturaElectronica[];

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: Lote | null,
        newValue: Lote | null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = Lote.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}