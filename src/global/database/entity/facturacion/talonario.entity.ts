import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { FormatoFactura } from "../formato-factura.entity";
import { Schemas } from "@database/meta/schemas";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { TalonarioDTO } from "@dto/talonario.dto";

@Entity({schema: Schemas.FACTURACION})
export class Talonario{

    constructor(talonarioDTO?: TalonarioDTO){
        if(talonarioDTO != null) this.loadDTO(talonarioDTO);
    }

    @PrimaryColumn()
    id: number;

    @Column({
        name: 'nro_timbrado',
        type: "numeric",
        scale: 8,
        precision: 0,
        nullable: false,
    })
    nroTimbrado: number;

    @Column({
        name: 'cod_establecimiento',
        type: 'numeric',
        scale: 3,
        precision: 0,
        nullable: false
    })
    codEstablecimiento: number;

    @Column({
        name: 'cod_punto_emision',
        type: 'numeric',
        scale: 3,
        precision: 0,
        nullable: false
    })
    codPuntoEmision: number;

    @Column({
        name: 'nro_inicio', 
        type: 'numeric',
        scale: 7,
        precision: 0,
        nullable: false
    })
    nroInicio: number;

    @Column({
        name: 'nro_fin',
        type: 'numeric',
        scale: 7,
        precision: 0,
        nullable: false,
        default: 9999999
    })
    nroFin: number;

    @Column({
        name: 'ultimo_nro_usado',
        type: 'numeric',
        scale: 7,
        precision: 0
    })
    ultimoNroUsado: number;

    @Column({name: 'fecha_inicio_vigencia', type: 'date', nullable: false})
    fechaInicioVigencia: Date;

    @Column({name: 'fecha_vencimiento', type: 'date'})
    fechaVencimiento: Date;

    @Column({nullable: false, default: true})
    activo: boolean;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    @Column({name: 'idformato_factura'})
    idformatoFactura: number;

    @Column({name: 'electronico', nullable: false, default: false})
    electronico: boolean;

    @ManyToOne(() => FormatoFactura, (formato) => formato.talonarios)
    @JoinColumn({
        name: 'idformato_factura'
    })
    formato: FormatoFactura;

    private loadDTO(talonarioDTO: TalonarioDTO): void {
        this.id = talonarioDTO.id;
        this.codEstablecimiento = talonarioDTO.codestablecimiento;
        this.codPuntoEmision = talonarioDTO.codpuntoemision;
        this.fechaInicioVigencia = new Date(`${talonarioDTO.fechainicio}T00:00:00`);
        if (talonarioDTO.fechavencimiento) this.fechaVencimiento = new Date(`${talonarioDTO.fechavencimiento}T00:00:00`);
        this.nroInicio = talonarioDTO.nroinicio;
        if (talonarioDTO.nrofin) this.nroFin = talonarioDTO.nrofin;
        this.nroTimbrado = talonarioDTO.nrotimbrado;
        this.ultimoNroUsado = talonarioDTO.ultimonrousado;
        this.activo = talonarioDTO.activo;
        this.idformatoFactura = talonarioDTO.idformatofactura;
        this.electronico = talonarioDTO.electronico;        
    }

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(9, 'talonario');
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