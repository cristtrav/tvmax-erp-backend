import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Talonario } from "./talonario.entity";
import { Schemas } from "@database/meta/schemas";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { TimbradoDTO } from "@dto/facturacion/timbrado.dto";

@Entity({schema: Schemas.FACTURACION})
export class Timbrado {

    constructor(timbradoDto?: TimbradoDTO){
        if(timbradoDto) this.loadDTO(timbradoDto);
    }

    @PrimaryColumn({name: 'nro_timbrado'})
    nroTimbrado: number;

    @Column({
        name: 'fecha_inicio_vigencia',
        type: 'timestamp with time zone',
        nullable: false
    })
    fechaInicioVigencia: Date;

    @Column({
        name: 'fecha_vencimiento',
        type: 'timestamp with time zone'        
    })
    fechaVencimiento: Date;

    @Column({nullable: false, default: false})
    electronico: boolean;

    @Column({nullable: false, default: true})
    activo: boolean;

    @Column({nullable: false, default: false})
    eliminado: boolean;
    
    @OneToMany(() => Talonario, (talonario) => talonario.timbrado)
    talonarios: Talonario[]

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(39, 'Timbrados');
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

    private loadDTO(timbradoDto: TimbradoDTO){
        this.nroTimbrado = timbradoDto.nrotimbrado;
        this.fechaInicioVigencia = new Date(timbradoDto.fechainiciovigencia);
        if(timbradoDto.fechavencimiento)
            this.fechaVencimiento = new Date(timbradoDto.fechavencimiento);
        else
            this.fechaVencimiento = null;
        this.electronico = timbradoDto.electronico;
        this.activo = timbradoDto.activo;
        this.eliminado = timbradoDto.eliminado;
    }
}